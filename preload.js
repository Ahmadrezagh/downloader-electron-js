const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('electronAPI', {
    downloadItem: (url) => ipcRenderer.send('download',url),
    getDownloadList: () => ipcRenderer.send('get_downloads'),
    puseDownloadItem: (id) => ipcRenderer.send('downloadManager-pauseDownload',id),
    cancelDownloadItem: (id) => ipcRenderer.send('downloadManager-cancelDownload',id),
    resumeDownload: (id) => ipcRenderer.send('downloadManager-resumeDownload',id),
    openFile: (id) => ipcRenderer.send('downloadManager-openFile',id),
})

window.addEventListener('DOMContentLoaded', () => {
    const downloadsListTable = document.getElementById('downloadsList')
    ipcRenderer.on('downloadsList', (_event, downloadsList) => {
        downloadsList.forEach(element => {
            let downloadObject = `
            <tr>
                                <td class="align-middle min-w-[4rem]">
                                    <input type="checkbox">
                                </td>
                                <td class="min-w-[150px] max-w-[150px]">
                                    <div class="flex justify-center items-center gap-4">
                                        <img src="./media/download.svg" class="w-11">
                                        <div class="flex flex-col justify-start items-start text-start">
                                            <span class="text-white whitespace-nowrap">${element.fileName}</span>`

                                            if(element.percentage == 100){
                                                downloadObject = downloadObject + `
                                                <button type="button" class="text-green-400 whitespace-nowrap" onClick="openFile('${element.id}')">
                                                Open file
                                                </button>
                                                `
                                            }
                        downloadObject = downloadObject +   `
                                        </div>
                                    </div>
                                </td>
                                <td class="text-center">
                                    <div class="w-80 mx-auto">
                                        <div class="progress-wrapper">
                                            <span class="percent">${element.percentage}%</span>
                                            <div class="progress w-full !rounded-lg">
                                                <div class="progress-bar" role="progressbar" style="width: ${element.percentage}%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                                </div>
                                            </div>
                                             <span class="time">${element.totalReceivedMB}MB</span> 
                                        </div>
                                    </div>
                                </td>
                                <td class="text-center">
                                    <span class="whitespace-nowrap">${element.state}</span>
                                </td>
                                <td class="text-center">
                                    <span class="whitespace-nowrap">
                                        ${element.size} MB
                                    </span>
                                </td>
                                <td class="text-center">
                                    <span class="whitespace-nowrap">
                                        ${element.getStartTime}
                                    </span>
                                </td>
                                <td class="text-center">
                                    <div class="flex gap-2 w-full justify-center items-center mx-auto">`
                                    if(element.state == 'progressing')
                                    {
                                        if(element.isPpaused && element.canResume )
                                        {
                                            downloadObject = downloadObject + `
                                                <button type="button" onClick="resumeDownload('${element.id}')" >
                                                    <img src="./media/play.svg">
                                                </button>
                                            `
                                        }else{
                                            downloadObject = downloadObject + `
                                            <button type="button" onClick="pause('${element.id}')" >
                                                <img src="./media/pause.svg">
                                            </button>
                                        ` 
                                        }
                                        downloadObject = downloadObject + `
                                        <button type="button" onClick="cancel('${element.id}')" >
                                            <img src="./media/cancel.svg">
                                        </button>
                                        `
                                    }


                                    downloadObject = downloadObject + `
                                        
                                    </div>
                                </td>
                            </tr>
            `;
            downloadsListTable.innerHTML = downloadObject
        });
    })
    ipcRenderer.on('alertText', (_event,alertText) =>{
        alert(alertText)
    })
})