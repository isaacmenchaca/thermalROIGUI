$( document ).ready(function() {
    var filePath;
    var numImages = 0;
    var currentImage = 0;
    var currentDot = 0;
    var currentSavedCoordinates = [];

    // use these variables to save previous coordinates. make a button for it as well.

    $(".go-button").prop('disabled', true);
    $(".next-button").prop('disabled', true);
    $(".previous-button").prop('disabled', true);


    $(".choose-file-button").click(function(){
        onClickChooseFileButton();
    });


    $(".go-button").click(function(){
        onClickGoButton();
    });


    $(".next-button").click(function(){
        onClickNextButton();
    });

    $(".previous-button").click(function(){
        onClickPreviousButton();
    });

    $(".prev-coord-button").click(function(){
        onClickPreviousCoordButton();
    });


    $('.thermal-image').hover(function() {
        $(this).addClass('crosshair');
    }, function() {
        $(this).removeClass('crosshair');
    });


    $(".thermal-image").click(function(event) {
        const size = 4;
        var offset = $(this).offset();
        var x = Math.round(event.pageX - offset.left);
        var y = Math.round(event.pageY - offset.top);

        // Calculate the adjusted drawed circle.
        var adjustedX = x + 1.5 * size;
        var adjustedY = y + size;

        if(currentDot < 3){
            currentSavedCoordinates.push([x, y])
            console.log(currentSavedCoordinates);

            $(this).parent().append(`<div id="dot${currentDot}" style="width: ${size}px; height: ${size}px; background: black; position: absolute; top: ${adjustedY}px; left: ${adjustedX}px; border-radius: ${size}px"/>`); 
            
            switch(currentDot) {
                case 0:
                  // code block
                  $("#left-brow-coord").html("(" + x + ", " + y + ")");
                  break;
                case 1:
                  // code block
                  $("#right-brow-coord").html("(" + x + ", " + y + ")");
                  break;
                case 2:
                  // code block
                  $("#nose-tip-coord").html("(" + x + ", " + y + ")");
                  $(".next-button").prop('disabled', false);

              }

              currentDot += 1;
        } else{
            var shortestDistance = 1000
            var shortestDistanceIndex;

            currentSavedCoordinates.forEach(function(item, index){
                let a = x - item[0];
                let b = y - item[1];

                let d = Math.sqrt( a*a + b*b );

                if (d < shortestDistance){
                    shortestDistance = d;
                    shortestDistanceIndex = index;
                }

            });


            if(shortestDistance <= 15){
                currentSavedCoordinates[shortestDistanceIndex] = [x, y];
                $(`#dot${shortestDistanceIndex}`).remove()
                $(this).parent().append(`<div id="dot${shortestDistanceIndex}" style="width: ${size}px; height: ${size}px; background: black; position: absolute; top: ${adjustedY}px; left: ${adjustedX}px; border-radius: ${size}px"/>`); 
            
                switch(shortestDistanceIndex) {
                    case 0:
                      // code block
                      $("#left-brow-coord").html("(" + x + ", " + y + ")");
                      break;
                    case 1:
                      // code block
                      $("#right-brow-coord").html("(" + x + ", " + y + ")");
                      break;
                    case 2:
                      // code block
                      $("#nose-tip-coord").html("(" + x + ", " + y + ")");

                  }


                  console.log(currentSavedCoordinates);
            }

            
        }
    
    });


    $(document).keydown(function(event) {
        // Check if the event's key code is 'Z' and the control key (Ctrl) is pressed.
        if (event.ctrlKey && (event.key === 'z' || event.key === 'Z')) {
            // Handle the Control + Z key combination here

            switch(currentDot) {
                case 1:
                  // code block
                  $("#dot0").remove()
                  $("#left-brow-coord").html("");
                  currentSavedCoordinates.pop();
                  currentDot -= 1;
                  break;
                case 2:
                  // code block
                  $("#dot1").remove()
                  $("#right-brow-coord").html("");
                  currentSavedCoordinates.pop();
                  currentDot -= 1;
                  break;
                case 3:
                  // code block
                  $("#dot2").remove()
                  $("#nose-tip-coord").html("");
                  currentSavedCoordinates.pop();
                  $(".next-button").prop('disabled', true);
                  currentDot -= 1;
              }
              console.log(currentSavedCoordinates);
              
        }
    })

    async function onClickChooseFileButton(){
        // console.log("GO!")
        var path = await eel.onClickChooseFileButton()();
         if (path) {
           // console.log(path);
           $(".fileTextBox").val(path)
           filePath = path

           $(".go-button").prop('disabled', false);
         }
      }


      // still need to edit to check the last saved coordinate.
    async function onClickGoButton(){
        console.log("GO!")

        let dataFromPython = await eel.loadThermalInfo(filePath)();
        numImages = dataFromPython[0]
        currentImage = dataFromPython[1]


        $(".image-number-text").text(currentImage + " of " + numImages)
        
        if (currentImage === 1){
            $(".previous-button").prop('disabled', true);
        }
        else{
            $(".previous-button").prop('disabled', false);
        }
    }

    async function onClickNextButton(){
        // remove after testing
        $(".thermal-image").attr("src",  "");
        
        currentImage = await eel.saveCurrentProceedNextImage(filePath, currentImage, currentSavedCoordinates)();
        
        $(".image-number-text").text(currentImage + " of " + numImages)
        $(".previous-button").prop('disabled', false);

        newImageCleanUp();

        // check if data already exists for the next one.
        let nextExists = await eel.checkNextExists(filePath, currentImage)();


        if (nextExists){
            let dataFromPython = await eel.getCoordinates(filePath, currentImage)();
            dataFromPython.forEach(function(item, index){
                console.log(item)
                const size = 4;
                
                var x = item[0];
                var y = item[1];

                // Calculate the adjusted drawed circle.
                var adjustedX = x + 1.5 * size;
                var adjustedY = y + size;
                $(".modal-body").append(`<div id="dot${index}" style="width: ${size}px; height: ${size}px; background: black; position: absolute; top: ${adjustedY}px; left: ${adjustedX}px; border-radius: ${size}px"/>`); 
        
                // populate this because when we press next itll save the same values.
                currentSavedCoordinates.push([x, y])

                // update table to reflect these coordinates.
                switch(index) {
                    case 0:
                    // if index is 0
                    $("#left-brow-coord").html("(" + x + ", " + y + ")");
                    break;
                    case 1:
                    // if index is 1
                    $("#right-brow-coord").html("(" + x + ", " + y + ")");
                    break;
                    case 2:
                    // if index is 2
                    $("#nose-tip-coord").html("(" + x + ", " + y + ")");

                }
            })

            // at the end, set number of dots to 3 (possible index of 0, 1, or 2) to reflect state of how many dots drawn.
            currentDot = 3

            // set disabled to false since we have 3 points already available.
            $(".next-button").prop('disabled', false);
        }

    }




    async function onClickPreviousButton(){
        // remove after testing
        $(".thermal-image").attr("src",  "");

        // clean up any work first. Clears coordinate info.
        newImageCleanUp();

        // decrease for previous image
        currentImage -= 1

        // reflect decrease in text
        $(".image-number-text").text(currentImage + " of " + numImages)

        // call server.py: load up previous image here, and get previous coordinates
        let dataFromPython = await eel.goToPreviousImage(filePath, currentImage)();

        dataFromPython.forEach(function(item, index){
            console.log(item)
            const size = 4;
            
            var x = item[0];
            var y = item[1];

            // Calculate the adjusted drawed circle.
            var adjustedX = x + 1.5 * size;
            var adjustedY = y + size;
            $(".modal-body").append(`<div id="dot${index}" style="width: ${size}px; height: ${size}px; background: black; position: absolute; top: ${adjustedY}px; left: ${adjustedX}px; border-radius: ${size}px"/>`); 
       
            // populate this because when we press next itll save the same values.
            currentSavedCoordinates.push([x, y])

            // update table to reflect these coordinates.
            switch(index) {
                case 0:
                  // if index is 0
                  $("#left-brow-coord").html("(" + x + ", " + y + ")");
                  break;
                case 1:
                  // if index is 1
                  $("#right-brow-coord").html("(" + x + ", " + y + ")");
                  break;
                case 2:
                  // if index is 2
                  $("#nose-tip-coord").html("(" + x + ", " + y + ")");

            }
        })

        // at the end, set number of dots to 3 (possible index of 0, 1, or 2) to reflect state of how many dots drawn.
        currentDot = 3

        // set disabled to false since we have 3 points already available.
        $(".next-button").prop('disabled', false);
    }


    async function onClickPreviousCoordButton(){
        // clean up any work first. Clears coordinate info.
        newImageCleanUp();

        // call server.py: load up previous image here, and get previous coordinates
        let dataFromPython = await eel.getCoordinates(filePath, currentImage - 1)();

        dataFromPython.forEach(function(item, index){
            console.log(item)
            const size = 4;
            
            var x = item[0];
            var y = item[1];

            // Calculate the adjusted drawed circle.
            var adjustedX = x + 1.5 * size;
            var adjustedY = y + size;
            $(".modal-body").append(`<div id="dot${index}" style="width: ${size}px; height: ${size}px; background: black; position: absolute; top: ${adjustedY}px; left: ${adjustedX}px; border-radius: ${size}px"/>`); 
       
            // populate this because when we press next itll save the same values.
            currentSavedCoordinates.push([x, y])

            // update table to reflect these coordinates.
            switch(index) {
                case 0:
                  // if index is 0
                  $("#left-brow-coord").html("(" + x + ", " + y + ")");
                  break;
                case 1:
                  // if index is 1
                  $("#right-brow-coord").html("(" + x + ", " + y + ")");
                  break;
                case 2:
                  // if index is 2
                  $("#nose-tip-coord").html("(" + x + ", " + y + ")");

            }
        })

        // at the end, set number of dots to 3 (possible index of 0, 1, or 2) to reflect state of how many dots drawn.
        currentDot = 3

        // set disabled to false since we have 3 points already available.
        $(".next-button").prop('disabled', false);


    }

    function newImageCleanUp(){
        $("#dot0").remove()
        $("#left-brow-coord").html("");

        $("#dot1").remove()
        $("#right-brow-coord").html("");

        $("#dot2").remove()
        $("#nose-tip-coord").html("");
        $(".next-button").prop('disabled', true);


        currentDot = 0;
        currentSavedCoordinates = [];
    }


    eel.expose(updateImageSrc);
    function updateImageSrc(val) {
        $(".thermal-image").show();
        $(".localization-display").show();
        $(".thermal-image").attr("src",  "data:image/png;base64," + val)

    }

});