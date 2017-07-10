var electronInstaller = require('electron-winstaller');


resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './kvideojet-win32-x64',
    outputDirectory: './installer',
    authors: 'Sitek',
    exe: 'kvideojet.exe'
});


resultPromise.then(() => {
    console.log("The installers of your application were succesfully created !");
}, (e) => {
    console.log(`Well, sometimes you are not so lucky: ${e.message}`)
});