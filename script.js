document.addEventListener('DOMContentLoaded', function() {
    const containerDiv = document.getElementById('container');
    const storageAccountName = 'YOUR_STORAGE_ACCOUNT_NAME';
    const containerName = 'YOUR CONTAINER NAME';
    const sasToken = 'YOUR_SAS_TOKEN'; // Securely generate and store your SAS token

    const url = `https://${storageAccountName}.blob.core.windows.net/${containerName}?restype=container&comp=list&${sasToken}`;

fetch(listContainersUrl)
        .then(response => response.text())
        .then(data => {
            displayContainers(data);
        })
        .catch(error => console.error('Error fetching containers:', error));

    function displayContainers(data) {
        containerDiv.innerHTML = ''; // Clear the container div
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'application/xml');
        const containers = xmlDoc.getElementsByTagName('Container');

        for (let i = 0; i < containers.length; i++) {
            const containerName = containers[i].getElementsByTagName('Name')[0].textContent;

            // Filter out containers that start with a $
            if (containerName.startsWith('$')) {
                continue;
            }

            const containerUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}?${sasToken}`;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';

            const link = document.createElement('a');
            link.href = '#';
            link.textContent = containerName;
            link.addEventListener('click', function(event) {
                event.preventDefault();
                listBlobs(containerName);
            });

            itemDiv.appendChild(link);
            containerDiv.appendChild(itemDiv);
        }
    }

    function listBlobs(containerName) {
        const listBlobsUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}?restype=container&comp=list&${sasToken}`;

        fetch(listBlobsUrl)
            .then(response => response.text())
            .then(data => {
                containerDiv.innerHTML = ''; // Clear the container div
                const backLink = document.createElement('a');
                backLink.href = '#';
                backLink.textContent = '...';
                backLink.addEventListener('click', function(event) {
                    event.preventDefault();
                    fetch(listContainersUrl)
                        .then(response => response.text())
                        .then(data => {
                            displayContainers(data);
                        })
                        .catch(error => console.error('Error fetching containers:', error));
                });

                containerDiv.appendChild(backLink);

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, 'application/xml');
                const blobs = xmlDoc.getElementsByTagName('Blob');

                for (let i = 0; i < blobs.length; i++) {
                    const blobName = blobs[i].getElementsByTagName('Name')[0].textContent;
                    const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;

                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'item';

                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.textContent = blobName;
                    link.target = '_blank'; // Open link in a new tab

                    itemDiv.appendChild(link);
                    containerDiv.appendChild(itemDiv);
                }
            })
            .catch(error => console.error('Error fetching blobs:', error));
    }
});
