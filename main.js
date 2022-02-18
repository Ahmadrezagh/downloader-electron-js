const { app, BrowserWindow, ipcMain,shell } = require('electron')
const { spawn, exec } = require('child_process');
const axios = require('axios');
const path = require('path');
const baseDomain = 'https://soft360.ultimatesoft.co';

const createWindow = () => {
    const win = new BrowserWindow({
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      },
      width: 1000,
      height: 700
    })


    let downloads = []
    let downloadCounter = 0;

    win.webContents.session.on('will-download', (event, item, webContents) => {

      //Initialize download object 
      index = downloadCounter+1;
      downloads.push({ id:index, item })

      // 

      // Set the save path, making Electron not to prompt a save dialog.
      item.setSavePath(app.getPath("downloads") + "/Soft360-Downloads/" + item.getFilename())
      win.webContents.send('alertText', (item.getFilename()+" Started downloading..."))
      item.on('updated', (event, state) => {
        if (state === 'interrupted') {

      console.log(generateDownloadList(downloads))
      win.webContents.send('downloadsList', generateDownloadList(downloads))
          console.log('Download is interrupted but can be resumed')
        } else if (state === 'progressing') {

      console.log(generateDownloadList(downloads))
      win.webContents.send('downloadsList', generateDownloadList(downloads))
          if (item.isPaused()) {
            console.log('Download is paused')
          } else {

      console.log(generateDownloadList(downloads))
      win.webContents.send('downloadsList', generateDownloadList(downloads))
            console.log(`Received bytes: ${item.getReceivedBytes()}`)
          }
        }

      })
      item.once('done', (event, state) => {
        if (state === 'completed') {

      console.log(generateDownloadList(downloads))
      win.webContents.send('downloadsList', generateDownloadList(downloads))
          console.log('Download successfully')
        } else {

      console.log(generateDownloadList(downloads))
      win.webContents.send('downloadsList', generateDownloadList(downloads))
          console.log(`Download failed: ${state}`)
        }
      })
    })
  

    ipcMain.on("downloadManager-resumeDownload", (event, id) => {
      for(let i = 0; i < downloads.length; i++) {
        if(downloads[i].id == id) {
          downloads[i].item.resume();
          break;
        }
      }
    });
    
    ipcMain.on("downloadManager-pauseDownload", (event, id) => {
      for(let i = 0; i < downloads.length; i++) {
        if(downloads[i].id == id) {
          downloads[i].item.pause();
          break;
        }
      }
    });
    
    ipcMain.on("downloadManager-cancelDownload", (event, id) => {
      for(let i = 0; i < downloads.length; i++) {
        if(downloads[i].id == id) {
          downloads[i].item.cancel();
          downloads.splice(i, 1);
          break;
        }
      }
    });
  
    ipcMain.on("downloadManager-openFile", (event, id) => {
      for(let i = 0; i < downloads.length; i++) {
        if(downloads[i].id == id) {
          let path = downloads[i].item.getSavePath();
          shell.showItemInFolder(path)
        }
      }
    });

    ipcMain.on('get_downloads', (event) => {   
      console.log(generateDownloadList(downloads))
      win.webContents.send('downloadsList', generateDownloadList(downloads))
    })

    

    
    
    


    

  


    win.loadFile('assets/index.html')
  }

  app.whenReady().then(() => {
    downloadRequiredFiles()
    createWindow()
  })


function generateDownloadList(downloadsList)
{
  convertedList = [];
  downloadsList.forEach(element => {
      obj = {
        id : element.id,
        fileName : (element.item.getFilename().length > 10) ? element.item.getFilename().substring(0,10) : element.item.getFilename(),
        size : ( parseInt(element.item.getReceivedBytes() / 1000000) == parseInt(element.item.getTotalBytes() / 1000000) ) ? parseInt(element.item.getTotalBytes() / 1000000) : parseInt(element.item.getReceivedBytes() / 1000000) + " / " + parseInt(element.item.getTotalBytes() / 1000000),
        totalReceivedMB : parseInt(element.item.getReceivedBytes() / 1000000),
        getStartTime : unixToTime(element.item.getStartTime()),
        percentage : parseInt( (element.item.getReceivedBytes()/element.item.getTotalBytes()) * 100 ),
        state : element.item.getState(),
        isPpaused : element.item.isPaused(),
        canResume : element.item.canResume()
      }
      convertedList.push(obj)
  })
  return convertedList;
}


function unixToTime(unix_timestamp)
{
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(unix_timestamp * 1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();

    // Will display time in 10:30:23 format
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  return formattedTime;
}


function download(link)
{
  //Single file download
  let download = DownloadManager.download({
        url: link,
    },
    function (error, info) {
        if (error) {
            console.log(error);
            return;
        }
        console.log("DONE: " + info.url);
    });
}


async function downloadRequiredFiles()
{
  let requirements_path = "./WinRAR.v6.10.x86_p30download.com.zip"
  // GET request for remote image in node.js
  axios.get(baseDomain+'/api/v1/files')
  .then(function (response) {
    // handle success
    let files = response.data.data
    if(files.length > 0)
    {
      files.forEach(file => {
        downloadInBackGround(file.url,requirements_path)
      })
    }
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .then(function () {
    // always executed
  });
}

function downloadInBackGround(url,path)
{
  const ls = exec("curl -o "+path+" '" +url+ "'");

    ls.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
}