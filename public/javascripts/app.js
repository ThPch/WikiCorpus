var app = angular.module('WikiPPDApp', ['ngTagsInput','ngMaterial', 'ngMessages']);
/**====================================*\
 *  mycController
 ======================================*/
 app.controller('myController', function($scope, $http) {


 	$scope.data = [];
 	var request = $http.get('/data');
 	request.success(function(data) {
 		$scope.data = data;
 	});


 	request.error(function(data) {
 		console.log('Error: ' + data);
 	});

 });


/**====================================*\
 *  searchController
 ======================================*/
 app.controller('searchController', function($scope, $http) {
 	$scope.sendTags = () => {
 		tags = $scope.tags[0].text
 		var dice_coeff = $scope.dice_coeff;
 		console.log(tags + " & " + dice_coeff);
 		$http(
 		{
 			method: 'POST',
 			url: '/api/tags', 
 			data: {tags: tags,
 				   dice_coeff: dice_coeff}
 		})
 		.then(function successCallback(response) {
	       // this callback will be called asynchronously when the response is available
	       $scope.result = '';
	       $scope.result = response;

	   }, function errorCallback(response) {
		       // called asynchronously if an error occurs
		       // or server returns response with an error status.
		       console.log(response);
		   });
 	}
 	$scope.downloadJson = function(data)
 	{
 		var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));

 	}
 	$scope.downloadFile = function(filename, data) {
 			console.log(data)
 			data=JSON.stringify(data)
            var success = false;
            var contentType = 'text/plain;charset=utf-8';

            try
            {
                // Try using msSaveBlob if supported
                var blob = new Blob([data], { type: contentType });
                if(navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, filename);
                }
                else {
                    // Try using other saveBlob implementations, if available
                    var saveBlob = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
                    if(saveBlob === undefined) throw "Not supported";
                    saveBlob(blob, filename);
                }
                success = true;
            } catch(ex)
            {
                console.log("saveBlob method failed with the following exception:");
                console.log(ex);
            }

            if(!success)
            {
                // Get the blob url creator
                var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
                if(urlCreator)
                {
                    // Try to use a download link
                    var link = document.createElement('a');
                    if('download' in link)
                    {
                        // Try to simulate a click
                        try
                        {
                            // Prepare a blob URL
                            var blob = new Blob([data], { type: contentType });
                            var url = urlCreator.createObjectURL(blob);
                            link.setAttribute('href', url);

                            // Set the download attribute (Supported in Chrome 14+ / Firefox 20+)
                            link.setAttribute("download", filename);

                            // Simulate clicking the download link
                            var event = document.createEvent('MouseEvents');
                            event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                            link.dispatchEvent(event);
                            console.log("Download link method with simulated click succeeded");
                            success = true;

                        } catch(ex) {
                            console.log("Download link method with simulated click failed with the following exception:");
                            console.log(ex);
                        }
                    }

                    if(!success)
                    {
                        // Fallback to window.location method
                        try
                        {
                            // Prepare a blob URL
                            // Use application/octet-stream when using window.location to force download
                            console.log("Trying download link method with window.location ...");
                            var blob = new Blob([data], { type: octetStreamMime });
                            var url = urlCreator.createObjectURL(blob);
                            window.location = url;
                            console.log("Download link method with window.location succeeded");
                            success = true;
                        } catch(ex) {
                            console.log("Download link method with window.location failed with the following exception:");
                            console.log(ex);
                        }
                    }

                }
            }

            if(!success)
            {
                // Fallback to window.open method
                console.log("No methods worked for saving the arraybuffer, using last resort window.open.  Not Implemented");
                //window.open(httpPath, '_blank', '');
            }
        };


 });
