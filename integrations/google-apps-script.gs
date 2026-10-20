var SHEET_ENTITIES = [
  "companies",
  "departments",
  "offices",
  "positions",
  "employees",
  "shifts",
  "schedules",
  "rules",
  "leaves",
  "leave_requests",
  "overtime_categories",
  "overtime_requests",
  "holidays",
  "devices",
  "users",
  "attendance_log",
];

function getToken() {
  return (
    PropertiesService.getScriptProperties().getProperty("AUTH_TOKEN") || ""
  );
}

function openStore() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function isAllowedEntity(entity) {
  return SHEET_ENTITIES.indexOf(String(entity || "")) !== -1;
}

function assertEntity(entity) {
  if (!isAllowedEntity(entity)) {
    throw new Error("Entity tidak diizinkan: " + entity);
  }
}

function getOrCreateSheet(ss, entity) {
  assertEntity(entity);

  var sheet = ss.getSheetByName(entity);

  if (!sheet) {
    sheet = ss.insertSheet(entity);
    sheet.getRange(1, 1).setValue("id");
  }

  return sheet;
}

function getHeaders(sheet) {
  var lastColumn = Math.max(sheet.getLastColumn(), 1);

  var values = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

  return values.map(function (value) {
    return String(value || "").trim();
  });
}

function ensureColumns(sheet, obj) {
  var head = getHeaders(sheet);
  var changed = false;

  Object.keys(obj || {}).forEach(function (key) {
    if (!key) return;

    if (head.indexOf(key) === -1) {
      head.push(key);
      changed = true;
    }
  });

  if (changed) {
    sheet.getRange(1, 1, 1, head.length).setValues([head]);
  }

  return head;
}

function readAll(sheet) {
  var lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  var head = getHeaders(sheet);

  var values = sheet.getRange(2, 1, lastRow - 1, head.length).getValues();

  return values.map(function (row) {
    var obj = {};

    head.forEach(function (key, index) {
      if (key) {
        obj[key] = row[index];
      }
    });

    return obj;
  });
}

function appendRow(sheet, obj) {
  var head = ensureColumns(sheet, obj);

  var row = head.map(function (key) {
    var value = obj[key];

    return value === null || value === undefined ? "" : value;
  });

  sheet.appendRow(row);
}

function actionList(entity) {
  assertEntity(entity);

  var sheet = getOrCreateSheet(openStore(), entity);

  return readAll(sheet);
}

function actionGet(entity, id) {
  assertEntity(entity);

  var sheet = getOrCreateSheet(openStore(), entity);
  var rows = readAll(sheet);

  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].id) === String(id)) {
      return rows[i];
    }
  }

  return null;
}

function actionCreate(entity, data) {
  assertEntity(entity);

  data = data || {};

  if (!data.id) {
    data.id = Utilities.getUuid();
  }

  var sheet = getOrCreateSheet(openStore(), entity);

  appendRow(sheet, data);

  return actionGet(entity, data.id);
}

function actionUpdate(entity, id, data) {
  assertEntity(entity);

  var sheet = getOrCreateSheet(openStore(), entity);
  var head = ensureColumns(sheet, data);

  var lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return null;
  }

  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  var rowIndex = -1;

  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      rowIndex = i + 2;
      break;
    }
  }

  if (rowIndex === -1) {
    return null;
  }

  var current = sheet.getRange(rowIndex, 1, 1, head.length).getValues()[0];

  head.forEach(function (key, columnIndex) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      current[columnIndex] =
        data[key] === null || data[key] === undefined ? "" : data[key];
    }
  });

  sheet.getRange(rowIndex, 1, 1, head.length).setValues([current]);

  return actionGet(entity, id);
}

function actionRemove(entity, id) {
  assertEntity(entity);

  var sheet = getOrCreateSheet(openStore(), entity);
  var lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return { ok: false };
  }

  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);

      return {
        ok: true,
        id: id,
      };
    }
  }

  return {
    ok: false,
    id: id,
  };
}

function actionBulkUpsert(entity, rows, key) {
  assertEntity(entity);

  key = key || "id";
  rows = Array.isArray(rows) ? rows : [];

  if (!rows.length) {
    return {
      inserted: 0,
      updated: 0,
    };
  }

  var lock = LockService.getScriptLock();

  lock.waitLock(30000);

  try {
    var sheet = getOrCreateSheet(openStore(), entity);

    var head = getHeaders(sheet);

    // Tambahkan semua kolom terlebih dahulu.
    rows.forEach(function (row) {
      if (row && typeof row === "object") {
        Object.keys(row).forEach(function (field) {
          if (head.indexOf(field) === -1) {
            head.push(field);
          }
        });
      }
    });

    sheet.getRange(1, 1, 1, head.length).setValues([head]);

    var lastRow = sheet.getLastRow();

    var existingRows = [];

    if (lastRow >= 2) {
      existingRows = sheet.getRange(2, 1, lastRow - 1, head.length).getValues();
    }

    var keyIndex = head.indexOf(key);

    if (keyIndex === -1) {
      throw new Error("Kolom key tidak ditemukan: " + key);
    }

    var index = {};

    existingRows.forEach(function (row, indexZeroBased) {
      var value = row[keyIndex];

      if (value !== "" && value !== null && value !== undefined) {
        index[String(value)] = indexZeroBased;
      }
    });

    var inserted = 0;
    var updated = 0;

    var appendRows = [];

    rows.forEach(function (input) {
      if (!input || typeof input !== "object") {
        return;
      }

      var row = Object.assign({}, input);

      if (!row[key]) {
        row[key] = Utilities.getUuid();
      }

      var keyValue = String(row[key]);

      if (Object.prototype.hasOwnProperty.call(index, keyValue)) {
        var existingIndex = index[keyValue];
        var existing = existingRows[existingIndex];

        head.forEach(function (field, columnIndex) {
          if (Object.prototype.hasOwnProperty.call(row, field)) {
            existing[columnIndex] =
              row[field] === null || row[field] === undefined ? "" : row[field];
          }
        });

        updated++;
      } else {
        var newRow = head.map(function (field) {
          var value = row[field];

          return value === null || value === undefined ? "" : value;
        });

        appendRows.push(newRow);

        index[keyValue] = existingRows.length + appendRows.length - 1;

        inserted++;
      }
    });

    // Update existing rows in one write.
    if (existingRows.length > 0) {
      sheet
        .getRange(2, 1, existingRows.length, head.length)
        .setValues(existingRows);
    }

    // Append new rows in one write.
    if (appendRows.length > 0) {
      var appendStart = Math.max(sheet.getLastRow() + 1, 2);

      sheet
        .getRange(appendStart, 1, appendRows.length, head.length)
        .setValues(appendRows);
    }

    return {
      inserted: inserted,
      updated: updated,
    };
  } finally {
    lock.releaseLock();
  }
}

function actionQuery(entity, where) {
  assertEntity(entity);

  var rows = actionList(entity);

  if (!where || typeof where !== "object") {
    return rows;
  }

  var keys = Object.keys(where);

  if (!keys.length) {
    return rows;
  }

  return rows.filter(function (row) {
    return keys.every(function (key) {
      return String(row[key] ?? "") === String(where[key] ?? "");
    });
  });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json({
        error: "Request body kosong.",
      });
    }

    var body = JSON.parse(e.postData.contents);

    var expectedToken = getToken();

    if (!expectedToken || body.token !== expectedToken) {
      return json({
        error: "unauthorized",
      });
    }

    var entity = body.entity;

    if (entity) {
      assertEntity(entity);
    }

    var output;

    switch (body.action) {
      case "list":
        output = actionList(entity);
        break;

      case "get":
        output = actionGet(entity, body.id);
        break;

      case "create":
        output = actionCreate(entity, body.data || {});
        break;

      case "update":
        output = actionUpdate(entity, body.id, body.data || {});
        break;

      case "remove":
        output = actionRemove(entity, body.id);
        break;

      case "bulkUpsert":
        output = actionBulkUpsert(entity, body.rows || [], body.key || "id");
        break;

      case "query":
        output = actionQuery(entity, body.where || {});
        break;

      default:
        throw new Error("Unknown action: " + body.action);
    }

    return json({
      data: output,
    });
  } catch (error) {
    return json({
      error: String(error && error.message ? error.message : error),
    });
  }
}

function doGet() {
  return json({
    ok: true,
    service: "fingerspot-web-sheets",
    entities: SHEET_ENTITIES,
  });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function setupSheets() {
  var ss = openStore();

  SHEET_ENTITIES.forEach(function (entity) {
    getOrCreateSheet(ss, entity);
  });

  return "Sheets ready: " + SHEET_ENTITIES.join(", ");
}
