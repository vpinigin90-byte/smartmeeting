const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
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

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('Некорректный JSON в теле запроса'));
      }
    });
    req.on('error', reject);
  });
}

function toUtcDateTimeString(date) {
  return new Date(date).toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
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
  return { name: name.toUpperCase(), params, value: value.trim() };
}

function parseIcsDate(value, params = {}) {
  if (!value) return null;
  if (/^\d{8}$/.test(value)) {
    return new Date(Date.UTC(
      Number(value.slice(0, 4)),
      Number(value.slice(4, 6)) - 1,
      Number(value.slice(6, 8)),
      0, 0, 0
    ));
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
    return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second));
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
      if (current?.dtstart && current?.dtend) events.push(current);
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

  return events.filter((event) => (
    event.dtstart instanceof Date &&
    !Number.isNaN(event.dtstart) &&
    event.dtend instanceof Date &&
    !Number.isNaN(event.dtend) &&
    event.status !== 'CANCELLED' &&
    event.transparency !== 'TRANSPARENT'
  ));
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

function getTagValue(xml, tagName) {
  const match = xml.match(new RegExp(`<(?:[a-z0-9_-]+:)?${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[a-z0-9_-]+:)?${tagName}>`, 'i'));
  if (match) return match[1].trim();
  const selfClosing = xml.match(new RegExp(`<(?:[a-z0-9_-]+:)?${tagName}(?:\\s[^>]*)?\\s*/>`, 'i'));
  return selfClosing ? '' : '';
}

function getTagValueWithin(xml, sectionTag, childTag) {
  const sectionMatch = xml.match(new RegExp(`<(?:[a-z0-9_-]+:)?${sectionTag}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[a-z0-9_-]+:)?${sectionTag}>`, 'i'));
  if (!sectionMatch) return '';
  return getTagValue(sectionMatch[1], childTag);
}

function getTagValues(xml, tagName) {
  const values = [];
  const regex = new RegExp(`<(?:[a-z0-9_-]+:)?${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[a-z0-9_-]+:)?${tagName}>`, 'ig');
  let match;
  while ((match = regex.exec(xml))) {
    values.push(match[1].trim());
  }
  return values;
}

function getResponses(xml) {
  return (String(xml || '').match(/<[^:>]*:?response[\s\S]*?<\/[^:>]*:?response>/gi) || []);
}

function isCalendarContainerUrl(url, homeUrl) {
  if (!url) return true;
  const normalized = String(url).split('?')[0].replace(/\/+$/, '');
  const homeNormalized = String(homeUrl || '').split('?')[0].replace(/\/+$/, '');
  if (!normalized || normalized === homeNormalized) return true;
  const lower = normalized.toLowerCase();
  return lower.endsWith('/calendars') || lower.endsWith('/principals');
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
  if (!response.ok && response.status !== 207) {
    if (response.status === 401) {
      const error = new Error('Ошибка авторизации Mail.ru. Убедитесь, что используется пароль внешнего приложения.');
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
  const principalResponse = await caldavRequest({
    method: 'PROPFIND',
    url: `${rootUrl}principals/`,
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

  const principalPath = getTagValueWithin(principalResponse.text, 'current-user-principal', 'href') || getTagValue(principalResponse.text, 'href');
  const principalUrl = principalPath ? toAbsoluteUrl(rootUrl, principalPath) : `${rootUrl}principals/users/${encodeURIComponent(account)}/`;

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

  const homePath = getTagValueWithin(homeResponse.text, 'calendar-home-set', 'href') || getTagValue(homeResponse.text, 'href');
  const homeUrl = homePath ? toAbsoluteUrl(rootUrl, homePath) : `${rootUrl}calendars/${encodeURIComponent(account)}/`;

  const candidates = [];
  const queue = [homeUrl];
  const visited = new Set();

  while (queue.length) {
    const currentUrl = queue.shift();
    if (!currentUrl || visited.has(currentUrl)) continue;
    visited.add(currentUrl);

    const calendarsResponse = await caldavRequest({
      method: 'PROPFIND',
      url: currentUrl,
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
    <d:getcontenttype />
  </d:prop>
</d:propfind>`
    });

    for (const responseXml of getResponses(calendarsResponse.text)) {
      const href = getTagValue(responseXml, 'href');
      if (!href) continue;
      const resolvedUrl = toAbsoluteUrl(rootUrl, href);
      if (resolvedUrl === homeUrl || resolvedUrl === principalUrl) continue;
      if (visited.has(resolvedUrl)) continue;
      if (resolvedUrl !== currentUrl && !isCalendarContainerUrl(resolvedUrl, homeUrl)) {
        queue.push(resolvedUrl);
      }

      const displayName = getTagValue(responseXml, 'displayname') || fallbackMailruCalendarName(href);
      const contentType = (getTagValue(responseXml, 'getcontenttype') || '').toLowerCase();
      const resourceTypeXml = responseXml.toLowerCase();
      const looksLikeCalendar =
        /<(?:[a-z0-9_-]+:)?calendar(?:\s*\/>|>)/i.test(responseXml) ||
        /text\/calendar/i.test(contentType) ||
        /vnd\.caldav/i.test(contentType) ||
        (resourceTypeXml.includes('calendar') && !resourceTypeXml.includes('principal') && !resourceTypeXml.includes('home-set'));

      if (looksLikeCalendar) {
        candidates.push({ url: resolvedUrl, name: displayName });
      }
    }
  }

  const finalCalendars = candidates.length ? candidates : [];
  if (!finalCalendars.length) {
    throw new Error(`У аккаунта Mail.ru не найдено ни одного доступного календаря. Ответ сервера: ${homeUrl}`);
  }

  return { principalUrl, homeUrl, calendars: finalCalendars };
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
    for (const calendarData of getTagValues(responseXml, 'calendar-data')) {
      events.push(...parseCalendarEvents(calendarData));
    }
  }

  const fromTs = new Date(from).getTime();
  const toTs = new Date(to).getTime();

  return events
    .filter((event) => event.dtend.getTime() > fromTs && event.dtstart.getTime() < toTs)
    .sort((left, right) => left.dtstart - right.dtstart)
    .map((event) => ({
      uid: event.uid || '',
      summary: event.summary || 'Busy',
      start: event.dtstart.toISOString(),
      end: event.dtend.toISOString()
    }));
}

function renderMailruPage(res) {
  const filePath = path.join(ROOT, 'mailru-caldav.html');
  fs.readFile(filePath, (error, data) => {
    if (error) {
      send(res, 404, 'Not Found', 'text/plain; charset=utf-8');
      return;
    }
    send(res, 200, data, 'text/html; charset=utf-8');
  });
}

async function handleApi(req, res, requestUrl) {
  if (req.method === 'POST' && requestUrl.pathname === '/api/mailru/preview') {
    try {
      const body = await readJsonBody(req);
      const account = String(body.account || '').trim();
      const password = String(body.password || '').trim();
      if (!account || !password) {
        return sendError(res, 400, 'Укажите email Mail.ru и пароль внешнего приложения');
      }

      const discovery = await discoverMailruCalendars({ account, password });
      const candidateUrls = Array.from(new Set([
        String(body.calendarUrl || '').trim(),
        ...discovery.calendars.map((calendar) => calendar.url)
      ].filter(Boolean)));
      let selectedCalendar = null;
      let selectedCalendarUrl = '';

      if (!candidateUrls.length) {
        return sendError(res, 400, 'У аккаунта Mail.ru не найдено ни одного доступного календаря');
      }

      const from = body.from ? new Date(body.from) : null;
      const to = body.to ? new Date(body.to) : null;
      const hasRange = from instanceof Date && !Number.isNaN(from) && to instanceof Date && !Number.isNaN(to) && to > from;

      if (!hasRange) {
        selectedCalendarUrl = candidateUrls[0];
        selectedCalendar = discovery.calendars.find((calendar) => calendar.url === selectedCalendarUrl) || discovery.calendars[0] || null;
        return sendJson(res, 200, {
          ok: true,
          account,
          calendars: discovery.calendars,
          calendar: selectedCalendar,
          principalUrl: discovery.principalUrl,
          homeUrl: discovery.homeUrl
        });
      }

      let busySlots = [];
      let lastError = null;
      for (const calendarUrl of candidateUrls) {
        try {
          busySlots = await queryCalendarBusyEvents({
            account,
            password,
            calendarUrl,
            from,
            to
          });
          selectedCalendarUrl = calendarUrl;
          selectedCalendar = discovery.calendars.find((calendar) => calendar.url === calendarUrl) || { url: calendarUrl, name: fallbackMailruCalendarName(calendarUrl) };
          lastError = null;
          break;
        } catch (error) {
          lastError = error;
          if (error.statusCode !== 404) {
            throw error;
          }
        }
      }

      if (!selectedCalendarUrl) {
        throw lastError || new Error('Mail.ru CalDAV не вернул доступный календарь');
      }

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
    return sendJson(res, 200, { ok: true, status: 'healthy', timestamp: new Date().toISOString() });
  }

  return sendError(res, 404, 'API endpoint not found');
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (requestUrl.pathname.startsWith('/api/')) {
      return await handleApi(req, res, requestUrl);
    }

    if (requestUrl.pathname === '/' || requestUrl.pathname === '/mailru-caldav' || requestUrl.pathname === '/mailru-caldav.html') {
      return renderMailruPage(res);
    }

    const filePath = path.join(ROOT, path.normalize(decodeURIComponent(requestUrl.pathname)).replace(/^([.][.][\/\\])+/, ''));
    if (!filePath.startsWith(ROOT)) {
      return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
    }

    fs.stat(filePath, (statError, stats) => {
      if (statError) {
        return send(res, 404, 'Not Found', 'text/plain; charset=utf-8');
      }

      const finalPath = stats.isDirectory() ? path.join(filePath, 'mailru-caldav.html') : filePath;
      fs.readFile(finalPath, (readError, data) => {
        if (readError) {
          return send(res, 404, 'Not Found', 'text/plain; charset=utf-8');
        }

        const ext = path.extname(finalPath).toLowerCase();
        send(res, 200, data, MIME_TYPES[ext] || 'application/octet-stream');
      });
    });
  } catch (error) {
    sendError(res, 500, error.message || 'Internal Server Error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`mailru prototype server listening on ${HOST}:${PORT}`);
});
