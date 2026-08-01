const xlsx = require('xlsx');

function readAndPrint(filename) {
    console.log(`\n--- Reading ${filename} ---`);
    const workbook = xlsx.readFile(filename);
    
    for (const sheetName of workbook.SheetNames) {
        console.log(`\nSheet: ${sheetName}`);
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (data.length > 0) {
            console.log('Headers (Row 1):', data[0]);
            if (data.length > 1) console.log('Row 2:', data[1]);
            if (data.length > 2) console.log('Row 3:', data[2]);
            console.log(`Total rows: ${data.length}`);
        } else {
            console.log('Empty sheet');
        }
    }
}

try {
    readAndPrint('Asset Master.xlsx');
    readAndPrint('Employee Master.xlsx');
} catch (error) {
    console.error('Error reading excel files:', error);
}
