const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || (fs.existsSync('/data') ? '/data' : path.join(ROOT, 'data'));
const LEGACY_DATA_DIR = path.join(ROOT, 'data');
const MAILRU_CONFIG_PATH = path.join(DATA_DIR, 'mailru-calendar-integration.json');
const LEGACY_MAILRU_CONFIG_PATH = path.join(LEGACY_DATA_DIR, 'mailru-calendar-integration.json');
const WIDGETS_PATH = path.join(DATA_DIR, 'widgets.json');
const LEGACY_WIDGETS_PATH = path.join(LEGACY_DATA_DIR, 'widgets.json');
const CONFIG_SECRET = process.env.MAILRU_CONFIG_SECRET || process.env.APP_SECRET || '';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

const MAILRU_DEFAULT_CONFIG = {
  enabled: false,
  employees: {},
  updatedAt: null
};

const WIDGETS_DEFAULT_CONFIG = {
  widgets: [],
  updatedAt: null
};

function send(res, statusCode, body, contentType) {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(body);
}

function sendJson(res, statusCode, payload) {
  send(res, statusCode, JSON.stringify(payload), 'application/json; charset=utf-8');
}

function sendError(res, statusCode, message, details) {
  sendJson(res, statusCode, { ok: false, error: message, details: details || null });
}

function resolveRequestPath(urlPath) {
  if (urlPath === '/' || urlPath === '') {
    return path.join(ROOT, 'admin.html');
  }

  const normalized = path.normalize(decodeURIComponent(urlPath)).replace(/^([.][.][\/\\])+/, '');
  return path.join(ROOT, normalized);
}

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function secretKey() {
  return crypto.createHash('sha256').update(CONFIG_SECRET).digest();
}

function encryptSecret(value) {
  if (!value) return '';
  if (!CONFIG_SECRET) return `plain:${Buffer.from(value, 'utf8').toString('base64')}`;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptSecret(value) {
  if (!value) return '';
  if (value.startsWith('plain:')) {
    return Buffer.from(value.slice(6), 'base64').toString('utf8');
  }
  if (!value.startsWith('enc:')) {
    return value;
  }
  if (!CONFIG_SECRET) {
    throw new Error('Для расшифровки сохранённого пароля нужен MAILRU_CONFIG_SECRET или APP_SECRET');
  }
  const [, ivHex, tagHex, payloadHex] = value.split(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    secretKey(),
    Buffer.from(ivHex, 'hex')
  );
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payloadHex, 'hex')),
    decipher.final()
  ]);
  return decrypted.toString('utf8');
}

function loadMailruConfig() {
  const candidates = [MAILRU_CONFIG_PATH, LEGACY_MAILRU_CONFIG_PATH].filter((value, index, self) => self.indexOf(value) === index);
  for (const candidate of candidates) {
    try {
      const raw = fs.readFileSync(candidate, 'utf8');
      const parsed = JSON.parse(raw);
      const normalized = {
        ...MAILRU_DEFAULT_CONFIG,
        ...parsed,
        employees: parsed.employees && typeof parsed.employees === 'object'
          ? parsed.employees
          : parsed.employeeBindings && typeof parsed.employeeBindings === 'object'
            ? parsed.employeeBindings
            : {}
      };
      if (candidate !== MAILRU_CONFIG_PATH) {
        try {
          saveMailruConfig(normalized);
        } catch (migrationError) {
          // Ignore migration failures and keep the legacy read path working.
        }
      }
      return normalized;
    } catch (error) {
      // Try the next candidate path.
    }
  }
  try {
    return { ...MAILRU_DEFAULT_CONFIG };
  } catch (error) {
    return { ...MAILRU_DEFAULT_CONFIG };
  }
}

function saveMailruConfig(config) {
  ensureDataDir();
  fs.writeFileSync(MAILRU_CONFIG_PATH, JSON.stringify(config, null, 2));
}

function loadWidgetsConfig() {
  const candidates = [WIDGETS_PATH, LEGACY_WIDGETS_PATH].filter((value, index, self) => self.indexOf(value) === index);
  for (const candidate of candidates) {
    try {
      const raw = fs.readFileSync(candidate, 'utf8');
      const parsed = JSON.parse(raw);
      const widgets = Array.isArray(parsed.widgets)
        ? parsed.widgets
        : Array.isArray(parsed)
          ? parsed
          : [];
      const normalized = {
        ...WIDGETS_DEFAULT_CONFIG,
        ...parsed,
        widgets
      };
      if (candidate !== WIDGETS_PATH) {
        try {
          saveWidgetsConfig(normalized);
        } catch (migrationError) {
          // Keep the legacy read path available if migration fails.
        }
      }
      return normalized;
    } catch (error) {
      // Try the next candidate path.
    }
  }
  return { ...WIDGETS_DEFAULT_CONFIG };
}

function saveWidgetsConfig(config) {
  ensureDataDir();
  fs.writeFileSync(WIDGETS_PATH, JSON.stringify(config, null, 2));
}

function normalizeStoredWidget(widget) {
  if (!widget || typeof widget !== 'object') return null;
  const id = String(widget.id || '').trim();
  if (!id) return null;
  const createdAt = typeof widget.createdAt === 'string' && widget.createdAt ? widget.createdAt : new Date().toISOString();
  const exportedAt = typeof widget.exportedAt === 'string' && widget.exportedAt ? widget.exportedAt : null;
  const name = typeof widget.name === 'string' ? widget.name : '';
  const config = widget.config && typeof widget.config === 'object' ? widget.config : {};
  const configuredSections = widget.configuredSections && typeof widget.configuredSections === 'object'
    ? widget.configuredSections
    : {};
  return {
    ...widget,
    id,
    name,
    createdAt,
    exportedAt,
    config,
    configuredSections
  };
}

function maskAccount(account) {
  if (!account || !account.includes('@')) return account || '';
  const [name, domain] = account.split('@');
  if (name.length <= 2) return `${name[0] || '*'}***@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
}

function mailruPublicConfig(config) {
  const employees = {};
  for (const [employeeId, employeeState] of Object.entries(config.employees || {})) {
    employees[employeeId] = {
      account: employeeState.account || '',
      maskedAccount: maskAccount(employeeState.account || ''),
      hasPassword: Boolean(employeeState.password),
      calendars: Array.isArray(employeeState.calendars) ? employeeState.calendars : [],
      selectedCalendarUrl: employeeState.selectedCalendarUrl || '',
      selectedCalendarName: employeeState.selectedCalendarName || '',
      updatedAt: employeeState.updatedAt || null,
      lastValidatedAt: employeeState.lastValidatedAt || null
    };
  }
  return {
    ok: true,
    enabled: !!config.enabled,
    employees,
    updatedAt: config.updatedAt || null
  };
}

function fallbackMailruCalendarName(href) {
  const cleanHref = String(href || '').split('?')[0].replace(/\/+$/, '');
  const lastSegment = cleanHref.split('/').filter(Boolean).pop() || '';
  if (!lastSegment) return 'Календарь Mail.ru';
  const decoded = decodeURIComponent(lastSegment).replace(/[-_]+/g, ' ').trim();
  if (!decoded) return 'Календарь Mail.ru';
  return decoded.charAt(0).toUpperCase() + decoded.slice(1);
}

function toAbsoluteUrl(base, href) {
  return new URL(href, base).toString();
}

function decodeXml(value) {
  return String(value || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

function getTagValue(xml, tagName) {
  const pattern = new RegExp(
    `<(?:[A-Za-z0-9_-]+:)?${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[A-Za-z0-9_-]+:)?${tagName}>`,
    'i'
  );
  const match = xml.match(pattern);
  return match ? decodeXml(match[1]) : '';
}

function getTagValues(xml, tagName) {
  const pattern = new RegExp(
    `<(?:[A-Za-z0-9_-]+:)?${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[A-Za-z0-9_-]+:)?${tagName}>`,
    'gi'
  );
  return [...xml.matchAll(pattern)].map(match => decodeXml(match[1]));
}

function getResponses(xml) {
  const pattern = /<(?:[A-Za-z0-9_-]+:)?response(?:\s[^>]*)?>([\s\S]*?)<\/(?:[A-Za-z0-9_-]+:)?response>/gi;
  return [...xml.matchAll(pattern)].map(match => match[1]);
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error('Некорректный JSON в теле запроса');
  }
}

function toUtcDateTimeString(date) {
  const iso = new Date(date).toISOString().replace(/[-:]/g, '');
  return iso.slice(0, 15) + 'Z';
}

function unfoldIcs(ics) {
  return String(ics || '').replace(/\r?\n[ \t]/g, '');
}

function parseIcsLine(line) {
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return null;
  const left = line.slice(0, colonIndex);
  const value = line.slice(colonIndex + 1);
  const [name, ...paramsRaw] = left.split(';');
  const params = {};
  for (const item of paramsRaw) {
    const eqIndex = item.indexOf('=');
    if (eqIndex === -1) continue;
    params[item.slice(0, eqIndex).toUpperCase()] = item.slice(eqIndex + 1);
  }
  return {
    name: name.toUpperCase(),
    params,
    value: value.trim()
  };
}

function getTimeZoneOffsetMillis(date, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(date)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return asUtc - date.getTime();
}

function zonedDateTimeToUtc(parts, timeZone) {
  let guess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  for (let i = 0; i < 3; i += 1) {
    const offset = getTimeZoneOffsetMillis(new Date(guess), timeZone);
    guess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - offset;
  }
  return new Date(guess);
}

function parseIcsDate(value, params = {}) {
  if (!value) return null;
  if (/^\d{8}$/.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6));
    const day = Number(value.slice(6, 8));
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  }

  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!match) return null;
  const parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6])
  };

  if (match[7] === 'Z') {
    return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second));
  }
  if (params.TZID) {
    return zonedDateTimeToUtc(parts, params.TZID);
  }
  return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}

function parseCalendarEvents(ics) {
  const lines = unfoldIcs(ics).split(/\r?\n/);
  const events = [];
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line === 'BEGIN:VEVENT') {
      current = {};
      continue;
    }
    if (line === 'END:VEVENT') {
      if (current?.dtstart && current?.dtend) {
        events.push(current);
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const parsed = parseIcsLine(line);
    if (!parsed) continue;
    if (parsed.name === 'DTSTART') current.dtstart = parseIcsDate(parsed.value, parsed.params);
    if (parsed.name === 'DTEND') current.dtend = parseIcsDate(parsed.value, parsed.params);
    if (parsed.name === 'SUMMARY') current.summary = parsed.value;
    if (parsed.name === 'UID') current.uid = parsed.value;
    if (parsed.name === 'STATUS') current.status = parsed.value.toUpperCase();
    if (parsed.name === 'TRANSP') current.transparency = parsed.value.toUpperCase();
  }

  return events.filter(event => (
    event.dtstart instanceof Date &&
    !Number.isNaN(event.dtstart) &&
    event.dtend instanceof Date &&
    !Number.isNaN(event.dtend) &&
    event.status !== 'CANCELLED' &&
    event.transparency !== 'TRANSPARENT'
  ));
}

async function caldavRequest({ method, url, account, password, headers = {}, body = null }) {
  const auth = Buffer.from(`${account}:${password}`).toString('base64');
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/xml, text/xml, */*',
      ...headers
    },
    body
  });

  const text = await response.text();
  console.log(`[CalDAV] ${method} ${url} → ${response.status}`);
  if (!response.ok && response.status !== 207) {
    console.error(`[CalDAV] Error body: ${text.trim().slice(0, 500)}`);
    if (response.status === 401) {
      const error = new Error('Ошибка авторизации Mail.ru. Убедитесь, что используется пароль внешнего приложения (не основной пароль аккаунта), созданный в настройках Mail.ru → Безопасность → «Пароли для внешних приложений» с типом доступа «Полный доступ к Календарю».');
      error.statusCode = 401;
      throw error;
    }
    const detail = text && text.trim() ? `: ${text.trim().slice(0, 240)}` : '';
    const error = new Error(`Mail.ru CalDAV вернул ${response.status}${detail}`);
    error.statusCode = response.status;
    error.responseText = text;
    throw error;
  }
  return { status: response.status, text };
}

async function discoverMailruCalendars({ account, password }) {
  const rootUrl = 'https://calendar.mail.ru/';
  // .well-known/caldav redirects to /principals/ — start discovery there directly
  const principalDiscoveryUrl = `${rootUrl}principals/`;
  const principalResponse = await caldavRequest({
    method: 'PROPFIND',
    url: principalDiscoveryUrl,
    account,
    password,
    headers: {
      Depth: '0',
      'Content-Type': 'application/xml; charset=utf-8'
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:current-user-principal />
  </d:prop>
</d:propfind>`
  });

  let principalUrl;
  const principalPath = getTagValue(principalResponse.text, 'href');
  if (principalPath) {
    principalUrl = toAbsoluteUrl(rootUrl, principalPath);
  } else {
    // Fall back to constructing principal URL from account email
    principalUrl = `${rootUrl}principals/users/${encodeURIComponent(account)}/`;
  }

  const homeResponse = await caldavRequest({
    method: 'PROPFIND',
    url: principalUrl,
    account,
    password,
    headers: {
      Depth: '0',
      'Content-Type': 'application/xml; charset=utf-8'
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <c:calendar-home-set />
  </d:prop>
</d:propfind>`
  });

  let homeUrl;
  const homePath = getTagValue(homeResponse.text, 'href');
  if (homePath) {
    homeUrl = toAbsoluteUrl(rootUrl, homePath);
  } else {
    // Fall back to constructing calendar home URL from account email
    homeUrl = `${rootUrl}calendars/${encodeURIComponent(account)}/`;
  }

  const calendarsResponse = await caldavRequest({
    method: 'PROPFIND',
    url: homeUrl,
    account,
    password,
    headers: {
      Depth: '1',
      'Content-Type': 'application/xml; charset=utf-8'
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:displayname />
    <d:resourcetype />
    <d:current-user-privilege-set />
  </d:prop>
</d:propfind>`
  });

  const responseBlocks = getResponses(calendarsResponse.text);
  const calendars = responseBlocks
    .map(responseXml => {
      const href = getTagValue(responseXml, 'href');
      if (!href) return null;
      const resolvedUrl = toAbsoluteUrl(rootUrl, href);
      const displayName = getTagValue(responseXml, 'displayname') || fallbackMailruCalendarName(href);
      const contentType = (getTagValue(responseXml, 'getcontenttype') || '').toLowerCase();
      const resourceTypeXml = responseXml.toLowerCase();
      const looksLikeCalendar =
        /<(?:[a-z0-9_-]+:)?calendar(?:\s*\/>|>)/i.test(responseXml) ||
        /text\/calendar/i.test(contentType) ||
        /vnd\.caldav/i.test(contentType) ||
        (resourceTypeXml.includes('calendar') && !resourceTypeXml.includes('principal'));
      if (!looksLikeCalendar) return null;
      return {
        url: resolvedUrl,
        name: displayName
      };
    })
    .filter(Boolean);

  const fallbackCalendars = calendars.length
    ? calendars
    : responseBlocks
        .map(responseXml => {
          const href = getTagValue(responseXml, 'href');
          if (!href) return null;
          const resolvedUrl = toAbsoluteUrl(rootUrl, href);
          if (resolvedUrl === homeUrl) return null;
          const displayName = getTagValue(responseXml, 'displayname') || fallbackMailruCalendarName(href);
          return {
            url: resolvedUrl,
            name: displayName
          };
        })
        .filter(Boolean);

  const finalCalendars = calendars.length ? calendars : fallbackCalendars;

  if (!finalCalendars.length) {
    throw new Error(`У аккаунта Mail.ru не найдено ни одного доступного календаря. Ответ сервера: ${calendarsResponse.text.slice(0, 240)}`);
  }

  return {
    principalUrl,
    homeUrl,
    calendars: finalCalendars
  };
}

async function queryCalendarBusyEvents({ account, password, calendarUrl, from, to }) {
  const response = await caldavRequest({
    method: 'REPORT',
    url: calendarUrl,
    account,
    password,
    headers: {
      Depth: '1',
      'Content-Type': 'application/xml; charset=utf-8'
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:getetag />
    <c:calendar-data />
  </d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT">
        <c:time-range start="${toUtcDateTimeString(from)}" end="${toUtcDateTimeString(to)}" />
      </c:comp-filter>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>`
  });

  const events = [];
  for (const responseXml of getResponses(response.text)) {
    const calendarDataEntries = getTagValues(responseXml, 'calendar-data');
    for (const calendarData of calendarDataEntries) {
      events.push(...parseCalendarEvents(calendarData));
    }
  }

  const fromTs = new Date(from).getTime();
  const toTs = new Date(to).getTime();

  return events
    .filter(event => event.dtend.getTime() > fromTs && event.dtstart.getTime() < toTs)
    .sort((left, right) => left.dtstart - right.dtstart)
    .map(event => ({
      uid: event.uid || '',
      summary: event.summary || 'Busy',
      start: event.dtstart.toISOString(),
      end: event.dtend.toISOString()
    }));
}

async function handleApi(req, res, requestUrl) {
  if (req.method === 'GET' && requestUrl.pathname === '/api/widgets') {
    const data = loadWidgetsConfig();
    return sendJson(res, 200, {
      ok: true,
      widgets: Array.isArray(data.widgets) ? data.widgets.map(normalizeStoredWidget).filter(Boolean) : [],
      updatedAt: data.updatedAt || null
    });
  }

  if (req.method === 'GET' && requestUrl.pathname.startsWith('/api/widgets/')) {
    const widgetId = decodeURIComponent(requestUrl.pathname.slice('/api/widgets/'.length)).trim();
    if (!widgetId) {
      return sendError(res, 400, 'Не передан идентификатор виджета');
    }
    const data = loadWidgetsConfig();
    const widget = (Array.isArray(data.widgets) ? data.widgets : []).map(normalizeStoredWidget).find(item => item && item.id === widgetId);
    if (!widget) {
      return sendError(res, 404, 'Виджет не найден');
    }
    return sendJson(res, 200, { ok: true, widget });
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/widgets') {
    try {
      const body = await readJsonBody(req);
      const incomingWidgets = Array.isArray(body.widgets)
        ? body.widgets
        : Array.isArray(body.data?.widgets)
          ? body.data.widgets
          : null;
      if (!incomingWidgets) {
        return sendError(res, 400, 'Ожидался массив widgets');
      }
      const nextConfig = {
        widgets: incomingWidgets.map(normalizeStoredWidget).filter(Boolean),
        updatedAt: new Date().toISOString()
      };
      saveWidgetsConfig(nextConfig);
      return sendJson(res, 200, {
        ok: true,
        widgets: nextConfig.widgets,
        updatedAt: nextConfig.updatedAt
      });
    } catch (error) {
      return sendError(res, error.statusCode || 500, error.message);
    }
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/integrations/mailru') {
    return sendJson(res, 200, mailruPublicConfig(loadMailruConfig()));
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/integrations/mailru') {
    try {
      const body = await readJsonBody(req);
      const currentConfig = loadMailruConfig();
      const enabled = Boolean(body.enabled);
      const nextConfig = {
        ...currentConfig,
        enabled,
        employees: enabled ? (currentConfig.employees || {}) : {},
        updatedAt: new Date().toISOString()
      };
      saveMailruConfig(nextConfig);
      return sendJson(res, 200, mailruPublicConfig(nextConfig));
    } catch (error) {
      return sendError(res, error.statusCode || 500, error.message);
    }
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/integrations/mailru/employee/test') {
    try {
      const body = await readJsonBody(req);
      const currentConfig = loadMailruConfig();
      const employeeId = String(body.employeeId || '').trim();
      const account = String(body.account || '').trim();
      const currentEmployee = currentConfig.employees?.[employeeId] || {};
      const password = String(body.password || '').trim() || decryptSecret(currentEmployee.password || '');
      if (!employeeId) {
        return sendError(res, 400, 'Не передан сотрудник для настройки Mail.ru');
      }
      if (!account || !password) {
        return sendError(res, 400, 'Укажите email Mail.ru и пароль внешнего приложения');
      }

      const result = await discoverMailruCalendars({ account, password });
      return sendJson(res, 200, {
        ok: true,
        employeeId,
        account,
        calendars: result.calendars,
        principalUrl: result.principalUrl,
        homeUrl: result.homeUrl
      });
    } catch (error) {
      return sendError(res, error.statusCode || 500, error.message);
    }
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/integrations/mailru/employee') {
    try {
      const body = await readJsonBody(req);
      const currentConfig = loadMailruConfig();
      const employeeId = String(body.employeeId || '').trim();
      if (!employeeId) {
        return sendError(res, 400, 'Не передан сотрудник для сохранения настройки Mail.ru');
      }
      const account = String(body.account || '').trim();
      const password = String(body.password || '').trim();
      const selectedCalendarUrl = String(body.selectedCalendarUrl || '').trim();
      const selectedCalendarName = String(body.selectedCalendarName || '').trim();
      const currentEmployee = currentConfig.employees?.[employeeId] || {};
      const storedPassword = password || decryptSecret(currentEmployee.password || '');
      const accountChanged = Boolean(account) && account !== currentEmployee.account;
      const calendars = accountChanged ? [] : (Array.isArray(currentEmployee.calendars) ? currentEmployee.calendars : []);
      const resolvedCalendar = calendars.find(calendar => calendar.url === selectedCalendarUrl);
      const nextEmployee = {
        ...currentEmployee,
        account,
        password: storedPassword ? encryptSecret(storedPassword) : currentEmployee.password || '',
        calendars,
        selectedCalendarUrl: resolvedCalendar?.url || selectedCalendarUrl || '',
        selectedCalendarName: resolvedCalendar?.name || selectedCalendarName || '',
        updatedAt: new Date().toISOString(),
        lastValidatedAt: currentEmployee.lastValidatedAt || null
      };

      const nextConfig = {
        ...currentConfig,
        employees: {
          ...(currentConfig.employees || {}),
          [employeeId]: nextEmployee
        },
        updatedAt: new Date().toISOString(),
      };

      saveMailruConfig(nextConfig);
      return sendJson(res, 200, {
        ok: true,
        employeeId,
        employee: mailruPublicConfig(nextConfig).employees[employeeId]
      });
    } catch (error) {
      return sendError(res, error.statusCode || 500, error.message);
    }
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/integrations/mailru/employee/refresh') {
    try {
      const body = await readJsonBody(req);
      const currentConfig = loadMailruConfig();
      const employeeId = String(body.employeeId || '').trim();
      const currentEmployee = currentConfig.employees?.[employeeId] || {};
      const account = String(currentEmployee.account || '').trim();
      const password = decryptSecret(currentEmployee.password || '');
      if (!account || !password) {
        return sendError(res, 400, 'Сначала сохраните аккаунт Mail.ru и пароль внешнего приложения');
      }
      const discovery = await discoverMailruCalendars({ account, password });
      const nextConfig = {
        ...currentConfig,
        employees: {
          ...(currentConfig.employees || {}),
          [employeeId]: {
            ...currentEmployee,
            calendars: discovery.calendars,
            updatedAt: new Date().toISOString(),
            lastValidatedAt: new Date().toISOString()
          }
        },
        updatedAt: new Date().toISOString()
      };
      saveMailruConfig(nextConfig);
      return sendJson(res, 200, {
        ok: true,
        employeeId,
        employee: mailruPublicConfig(nextConfig).employees[employeeId]
      });
    } catch (error) {
      return sendError(res, error.statusCode || 500, error.message);
    }
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/integrations/mailru/employee/reset') {
    try {
      const body = await readJsonBody(req);
      const currentConfig = loadMailruConfig();
      const employeeId = String(body.employeeId || '').trim();
      if (!employeeId) {
        return sendError(res, 400, 'Не передан сотрудник для сброса Mail.ru настройки');
      }
      const nextConfig = {
        ...currentConfig,
        employees: {
          ...(currentConfig.employees || {}),
          [employeeId]: {
            account: '',
            password: '',
            calendars: [],
            selectedCalendarUrl: '',
            selectedCalendarName: '',
            updatedAt: new Date().toISOString(),
            lastValidatedAt: null
          }
        },
        updatedAt: new Date().toISOString()
      };
      saveMailruConfig(nextConfig);
      return sendJson(res, 200, {
        ok: true,
        employeeId,
        employee: mailruPublicConfig(nextConfig).employees[employeeId]
      });
    } catch (error) {
      return sendError(res, error.statusCode || 500, error.message);
    }
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/integrations/mailru/availability') {
    try {
      const body = await readJsonBody(req);
      const currentConfig = loadMailruConfig();
      const employeeId = String(body.employeeId || '').trim();
      const employeeState = currentConfig.employees?.[employeeId] || {};
      const account = String(employeeState.account || '').trim();
      const password = decryptSecret(employeeState.password || '');
      if (!account || !password) {
        return sendError(res, 400, 'Интеграция Mail.ru ещё не настроена');
      }

      const from = body.from ? new Date(body.from) : null;
      const to = body.to ? new Date(body.to) : null;
      if (!employeeId) {
        return sendError(res, 400, 'Не передан сотрудник для проверки занятости');
      }
      if (!(from instanceof Date) || Number.isNaN(from) || !(to instanceof Date) || Number.isNaN(to) || to <= from) {
        return sendError(res, 400, 'Укажите корректный диапазон дат');
      }

      const calendarUrl = typeof body.calendarUrl === 'string' && body.calendarUrl.trim()
        ? body.calendarUrl.trim()
        : employeeState.selectedCalendarUrl;
      const calendarName = employeeState.selectedCalendarName || '';
      if (!calendarUrl) {
        return sendError(res, 400, 'Для сотрудника не выбран календарь Mail.ru');
      }

      const busySlots = await queryCalendarBusyEvents({
        account,
        password,
        calendarUrl,
        from,
        to
      });

      return sendJson(res, 200, {
        ok: true,
        employeeId,
        calendarUrl,
        calendarName,
        from: from.toISOString(),
        to: to.toISOString(),
        busySlots,
        isBusy: busySlots.length > 0
      });
    } catch (error) {
      return sendError(res, error.statusCode || 500, error.message);
    }
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/mailru/preview') {
    try {
      const body = await readJsonBody(req);
      const account = String(body.account || '').trim();
      const password = String(body.password || '').trim();
      if (!account || !password) {
        return sendError(res, 400, 'Укажите email Mail.ru и пароль внешнего приложения');
      }

      const discovery = await discoverMailruCalendars({ account, password });
      const selectedCalendarUrl = String(body.calendarUrl || '').trim() || (discovery.calendars[0] && discovery.calendars[0].url) || '';
      const selectedCalendar = discovery.calendars.find(calendar => calendar.url === selectedCalendarUrl) || discovery.calendars[0] || null;

      if (!selectedCalendarUrl) {
        return sendError(res, 400, 'У аккаунта Mail.ru не найдено ни одного доступного календаря');
      }

      const from = body.from ? new Date(body.from) : null;
      const to = body.to ? new Date(body.to) : null;
      const hasRange = from instanceof Date && !Number.isNaN(from) && to instanceof Date && !Number.isNaN(to) && to > from;

      if (!hasRange) {
        return sendJson(res, 200, {
          ok: true,
          account,
          calendars: discovery.calendars,
          calendar: selectedCalendar,
          principalUrl: discovery.principalUrl,
          homeUrl: discovery.homeUrl
        });
      }

      const busySlots = await queryCalendarBusyEvents({
        account,
        password,
        calendarUrl: selectedCalendarUrl,
        from,
        to
      });

      return sendJson(res, 200, {
        ok: true,
        account,
        calendars: discovery.calendars,
        calendar: selectedCalendar,
        from: from.toISOString(),
        to: to.toISOString(),
        busySlots,
        isBusy: busySlots.length > 0
      });
    } catch (error) {
      return sendError(res, error.statusCode || 500, error.message);
    }
  }

  if (req.method === 'GET' && (
    requestUrl.pathname === '/health' ||
    requestUrl.pathname === '/healthz' ||
    requestUrl.pathname === '/api/health' ||
    requestUrl.pathname === '/api/healthz'
  )) {
    return sendJson(res, 200, {
      ok: true,
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  }

  return sendError(res, 404, 'API endpoint not found');
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (requestUrl.pathname.startsWith('/api/')) {
      return await handleApi(req, res, requestUrl);
    }

    const filePath = resolveRequestPath(requestUrl.pathname);
    if (!filePath.startsWith(ROOT)) {
      send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
      return;
    }

    fs.stat(filePath, (statError, stats) => {
      if (statError) {
        send(res, 404, 'Not Found', 'text/plain; charset=utf-8');
        return;
      }

      const finalPath = stats.isDirectory() ? path.join(filePath, 'admin.html') : filePath;

      fs.readFile(finalPath, (readError, data) => {
        if (readError) {
          send(res, 404, 'Not Found', 'text/plain; charset=utf-8');
          return;
        }

        const ext = path.extname(finalPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        send(res, 200, data, contentType);
      });
    });
  } catch (error) {
    sendError(res, 500, error.message || 'Internal Server Error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`smartmeeting server listening on ${HOST}:${PORT}`);
});
