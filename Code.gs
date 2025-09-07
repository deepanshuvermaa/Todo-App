// Google Apps Script code to be deployed as a web app
// This handles backend operations with Google Sheets

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Beginner Todo App')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getTasks(sheetId, date) {
  try {
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Sheet1') || 
                  SpreadsheetApp.openById(sheetId).insertSheet('Sheet1');
    
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] === date);
    
    if (rowIndex !== -1) {
      const tasksString = data[rowIndex][1] || '';
      const notDoneString = data[rowIndex][2] || '';
      
      return {
        success: true,
        tasks: parseTasks(tasksString),
        notDoneTasks: notDoneString
      };
    }
    
    return { success: true, tasks: [], notDoneTasks: '' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function saveTasks(sheetId, date, tasksString, notDoneString) {
  try {
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Sheet1') || 
                  SpreadsheetApp.openById(sheetId).insertSheet('Sheet1');
    
    // Set headers if empty
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 3).setValues([['Date', 'Tasks To Do Today', 'Tasks Not Done Today']]);
    }
    
    const data = sheet.getDataRange().getValues();
    let rowIndex = data.findIndex(row => row[0] === date);
    
    if (rowIndex === -1) {
      // Add new row for this date
      rowIndex = sheet.getLastRow() + 1;
      sheet.getRange(rowIndex, 1).setValue(date);
    } else {
      rowIndex += 1; // Convert to 1-based index
    }
    
    sheet.getRange(rowIndex, 2).setValue(tasksString);
    sheet.getRange(rowIndex, 3).setValue(notDoneString || '');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function performDailyRollover(sheetId) {
  try {
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Sheet1');
    if (!sheet) return { success: false, error: 'Sheet not found' };
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const yesterdayStr = Utilities.formatDate(yesterday, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    const data = sheet.getDataRange().getValues();
    const yesterdayIndex = data.findIndex(row => row[0] === yesterdayStr);
    
    if (yesterdayIndex !== -1) {
      const yesterdayTasks = data[yesterdayIndex][1] || '';
      const tasks = parseTasks(yesterdayTasks);
      
      const pendingTasks = tasks.filter(task => !task.completed);
      const pendingTasksString = pendingTasks.map((task, index) => 
        `${index + 1}- ${task.text}`
      ).join('\n');
      
      if (pendingTasks.length > 0) {
        // Update yesterday's "tasks not done today" column
        sheet.getRange(yesterdayIndex + 1, 3).setValue(pendingTasksString);
        
        // Add pending tasks to today
        let todayIndex = data.findIndex(row => row[0] === todayStr);
        if (todayIndex === -1) {
          todayIndex = sheet.getLastRow() + 1;
          sheet.getRange(todayIndex, 1).setValue(todayStr);
          sheet.getRange(todayIndex, 2).setValue(pendingTasksString);
        } else {
          const existingTasks = sheet.getRange(todayIndex + 1, 2).getValue();
          const combinedTasks = existingTasks ? 
            existingTasks + '\n' + pendingTasksString : pendingTasksString;
          sheet.getRange(todayIndex + 1, 2).setValue(combinedTasks);
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function parseTasks(tasksString) {
  if (!tasksString) return [];
  
  const lines = tasksString.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const match = line.match(/^\d+- (.+)$/);
    if (match) {
      const text = match[1];
      const completed = text.endsWith(' - done');
      return {
        text: completed ? text.slice(0, -7) : text,
        completed: completed
      };
    }
    return null;
  }).filter(task => task !== null);
}

function createTimeDrivenTrigger() {
  // Create a trigger to run daily rollover at midnight
  ScriptApp.newTrigger('runDailyRollover')
    .timeBased()
    .atHour(0)
    .everyDays(1)
    .create();
}

function runDailyRollover() {
  // This function should be configured with sheet IDs of all users
  // For production, you'd need a database of user sheet IDs
  const userSheets = PropertiesService.getScriptProperties().getProperty('userSheets');
  if (userSheets) {
    const sheetIds = JSON.parse(userSheets);
    sheetIds.forEach(sheetId => {
      performDailyRollover(sheetId);
    });
  }
}

function registerUserSheet(sheetId) {
  const props = PropertiesService.getScriptProperties();
  let userSheets = props.getProperty('userSheets');
  
  if (userSheets) {
    const sheetIds = JSON.parse(userSheets);
    if (!sheetIds.includes(sheetId)) {
      sheetIds.push(sheetId);
      props.setProperty('userSheets', JSON.stringify(sheetIds));
    }
  } else {
    props.setProperty('userSheets', JSON.stringify([sheetId]));
  }
  
  return { success: true };
}

function createNewUserSheet() {
  try {
    const sheet = SpreadsheetApp.create('Todo App Data');
    const sheetId = sheet.getId();
    
    // Set up the structure
    const activeSheet = sheet.getActiveSheet();
    activeSheet.setName('Sheet1');
    activeSheet.getRange(1, 1, 1, 3).setValues([['Date', 'Tasks To Do Today', 'Tasks Not Done Today']]);
    
    // Format headers
    activeSheet.getRange(1, 1, 1, 3)
      .setFontWeight('bold')
      .setBackground('#f0f0f0');
    
    // Set column widths
    activeSheet.setColumnWidth(1, 120);
    activeSheet.setColumnWidth(2, 400);
    activeSheet.setColumnWidth(3, 400);
    
    return { 
      success: true, 
      sheetId: sheetId,
      sheetUrl: sheet.getUrl()
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}