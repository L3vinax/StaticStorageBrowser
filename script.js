document.addEventListener('DOMContentLoaded', function() {
    const breadcrumbDiv = document.getElementById('breadcrumb');
    const containerDiv = document.getElementById('container');
    const navigateBackButton = document.getElementById('navigateBack');
    const storageAccountName = 'STORAGE_ACCOUNT_NAME';
    const sasToken = 'YOUR_SAS_TOKEN'; // Securely generate and store your SAS token

    const listContainersUrl = `https://${storageAccountName}.blob.core.windows.net/?comp=list&${sasToken}`;
    const navigationStack = [];

    fetch(listContainersUrl)
        .then(response => response.text())
        .then(data => displayContainers(data))
        .catch(error => console.error('Error fetching containers:', error));

    navigateBackButton.addEventListener('click', function() {
        if (navigationStack.length > 0) {
            const previousState = navigationStack.pop();
            if (previousState.type === 'containers') {
                displayContainers(previousState.data);
            } else if (previousState.type === 'blobs') {
                displayBlobs(previousState.data, previousState.containerName);
            }
            updateBreadcrumb();
        }
    });

    function displayContainers(data) {
        navigationStack.push({ type: 'containers', data });
        containerDiv.innerHTML = ''; // Clear the container div
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'application/xml');
        const containers = xmlDoc.getElementsByTagName('Container');

        for (let i = 0; i < containers.length; i++) {
            const containerName = containers[i].getElementsByTagName('Name')[0].textContent;
            const containerUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}?${sasToken}`;

			if (containerName.startsWith('$')) {
                continue; // Skip containers that start with $
            }

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
        updateBreadcrumb();
    }

    function listBlobs(containerName) {
        const listBlobsUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}?restype=container&comp=list&${sasToken}`;

        fetch(listBlobsUrl)
            .then(response => response.text())
            .then(data => {
                navigationStack.push({ type: 'blobs', data, containerName });
                displayBlobs(data, containerName);
            })
            .catch(error => console.error('Error fetching blobs:', error));
    }

    function displayBlobs(data, containerName) {
        containerDiv.innerHTML = ''; // Clear the container div
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
        updateBreadcrumb();
    }

    function updateBreadcrumb() {
        breadcrumbDiv.innerHTML = ''; // Clear the breadcrumb div
        const homeLink = document.createElement('a');
        homeLink.href = '#';
        homeLink.textContent = 'Home';
        homeLink.addEventListener('click', function(event) {
            event.preventDefault();
            fetch(listContainersUrl)
                .then(response => response.text())
                .then(data => displayContainers(data))
                .catch(error => console.error('Error fetching containers:', error));
            navigationStack.length = 0; // Clear the stack
        });
        breadcrumbDiv.appendChild(homeLink);

        for (let i = 0; i < navigationStack.length; i++) {
            const state = navigationStack[i];
            const separator = document.createTextNode(' > ');
            breadcrumbDiv.appendChild(separator);

            const link = document.createElement('a');
            link.href = '#';
            link.textContent = state.type === 'containers' ? 'Containers' : state.containerName;
            link.addEventListener('click', function(event) {
                event.preventDefault();
                if (state.type === 'containers') {
                    displayContainers(state.data);
                } else {
                    displayBlobs(state.data, state.containerName);
                }
                navigationStack.length = i + 1; // Trim the stack
                updateBreadcrumb();
            });
            breadcrumbDiv.appendChild(link);
        }
    }
});
