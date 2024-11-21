document.addEventListener('DOMContentLoaded', function() {
    const containerDiv = document.getElementById('container');
    const storageAccountName = 'YOUR_STORAGE_ACCOUNT_NAME';
    const containerName = 'YOUR CONTAINER NAME';
    const sasToken = 'YOUR_SAS_TOKEN'; // Securely generate and store your SAS token

    const url = `https://${storageAccountName}.blob.core.windows.net/${containerName}?restype=container&comp=list&${sasToken}`;

fetch(url)
        .then(response => response.text())
        .then(data => {
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
        .catch(error => console.error('Error fetching container contents:', error));
});
