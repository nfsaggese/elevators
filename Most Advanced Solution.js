{
    //api driven approach...will optimize after every function is accounted for
    //needed threading to make it fast gets hung up executing side tasks
    //passes moves based tests
    init: function(elevators, floors) {
        var numFloors = floors.length-1;
        var midFloor = Math.round(numFloors / 2);//midpoint floor
        var topFloor = numFloors - 1;
        var distributeFlag = true;
        console.log(midFloor);
        

        function distribute(elevator){
           /* console.log('distribute');
            if(distributeFlag){
                elevator.destinationQueue.push(midFloor);
            }else{
                elevator.destinationQueue.push(0);
            }
            distributeFlag = !distributeFlag;
            //elevator.checkDestinationQueue();
            //set indicators to stopped*/
        }//close distribute
        
        function evaluateDirectionIndicator(elevator, destination){
            if(elevator.currentFloor() > destination){
                elevator.goingDownIndicator(true);
                elevator.goingUpIndicator(false);
                return "down";
            }else if(elevator.currentFloor() < destination){
                elevator.goingDownIndicator(false);
                elevator.goingUpIndicator(true);
                return "up";
            }else{
                elevator.goingDownIndicator(true);
                elevator.goingUpIndicator(true);
                return "stopped";
            }
        }

        function checkLengths(){
            if((upQueue.length > 0) || (upQueue.length > 0)){
                return true;
            }
            return false;
        }//close checkLengths

        function isThereRoom(elevator){
            var capacity = elevator.maxPassengerCount();
            var weight = elevator.loadFactor();
            var room = capacity - (capacity * weight);
            return Math.floor(room);
        }//close isThereRoom

        function process(elevator){
            console.log("process");
            elevator.goingUpIndicator(true);
            elevator.goingDownIndicator(true);
            var direction;

            if(checkLengths()){
                var space = isThereRoom(elevator);
                var allotted = 0;
                var qLength = 0;

                //simple directional decider / could be more efficiency driven

                if(elevator.currentFloor < midFloor){
                    direction = "up";
                    qLength = upQueue.length;
                }else{
                    direction = "down";
                    qLength = downQueue.length;
                }

                //if the space is greater than whats out there, set the space = queue length
                if(space > qLength){
                    space = qLength; 
                }
                console.time('waste');
                if(space >= 1){
                    console.log("adding new dest");
                    console.log("downQueue\t" + downQueue);
                    if(direction === "up"){
                        elevator.goingUpIndicator(true);
                        elevator.goingDownIndicator(false);
                        var currentFloor = elevator.currentFloor();
                        upQueue.sort(function(a, b){return a-b}).reverse();
                        while(allotted < space){
                            for(var i = 0; i < upQueue.length; i++){
                                if(upQueue[i] >= currentFloor){
                                    console.log("added up " + upQueue[i]);
                                    console.log("added up " + elevator.destinationQueue);
                                    elevator.destinationQueue.push(upQueue.splice(i, i+1));
                                    console.log("added up " + elevator.destinationQueue);
                                    //elevator.checkDestinationQueue();
                                    elevator.destinationQueue.sort(function(a, b){return a-b});
                                    allotted++;
                                    
                                }else{
                                    break;
                                }
                                //elevator.checkDestinationQueue();

                            }
                            break;
                        }//close while
                    }else{//direction down
                        
                        elevator.goingUpIndicator(false);
                        elevator.goingDownIndicator(true);
                        var currentFloor = elevator.currentFloor();
                        downQueue.sort(function(a, b){return a-b});
                        while(allotted < space){
                            console.log("112inside while " + downQueue);
                            for(var i = 0; i < downQueue.length; i++){
                                console.log("112for it\tdownQueue[i]\t" + downQueue[i] + " < " + currentFloor);
                               if(downQueue[i] <= currentFloor){
                                    console.log("112 here");
                                    console.log("112added down " + downQueue[i]);
                                    console.log("112added downq " + elevator.destinationQueue);
                                    elevator.destinationQueue.push(downQueue.splice(i, i+1));
                                    console.log("112added downq " + elevator.destinationQueue);
                                    //elevator.checkDestinationQueue();
                                    elevator.destinationQueue.sort(function(a, b){return a-b}).reverse();
                                    allotted++;
                                }else{
                                    break;
                                }
                                //elevator.checkDestinationQueue();

                            }//close for
                            break;
                            console.log("112we got here22");
                        }//close while
                    }//close else
                    console.timeEnd('waste');
                }else{
                    distribute(elevator);
                }
            }else{
                distribute(elevator);
            }//close else
            console.log("after process\t" + elevator.destinationQueue);
            if(elevator.destinationQueue.length === 0){
                distribute(elevator);
            }
            elevator.checkDestinationQueue();
        }//close process

        function elevatorsRun(){
            _.each(elevators, function(elevator){

                console.log("elevators");
                //if(elevator)
                elevator.on("idle", function() {
                    console.log("upQueue\t" + upQueue);
                    console.log("idle");
                    process(elevator);
                    elevator.checkDestinationQueue();

                });

                //inner elevator button pressed
                elevator.on("floor_button_pressed", function(floorNum) {
                    var direction = elevator.destinationDirection();
                    if(elevator.destinationQueue.length === 0){
                        evaluateDirectionIndicator(elevator,floorNum);
                    }
                    elevator.destinationQueue.push(floorNum);
                    elevator.destinationQueue = elevator.destinationQueue.sort(function(a, b){return a-b});
                    if(direction === "down"){
                        elevator.destinationQueue = elevator.destinationQueue.reverse();
                    }
                    //process(elevator);
                    elevator.checkDestinationQueue();
                });

                //elevator is passing a floor is it in our queues?
                elevator.on("passing_floor", function(floorNum, direction) {
                    //process(elevator);
                    console.log("Passing\t" + floorNum);
                    elevator.destinationQueue.sort(function(a, b){return a-b});
                    if(direction == "up"){
                        elevator.goingDownIndicator(false);
                        elevator.goingUpIndicator(true);
                    }else{//down
                        elevator.destinationQueue.reverse();
                        elevator.goingDownIndicator(true);
                        elevator.goingUpIndicator(false);
                    }//close else
                    //var allotted = 0;
                    var space = isThereRoom(elevator);
                    if(space >= 1){
                        if(direction === "up"){
                            var index = upQueue.indexOf(floorNum);
                            if(index != -1){
                                elevator.goToFloor(floorNum, true);
                                elevator.goingDownIndicator(true);
                                elevator.goingUpIndicator(false);
                                upQueue.splice(index, index+1);
                            }
                            /*while(allotted < space){
                                for(var i = floorNum + 1; i < floors.length; i++){
                                    //space = isThereRoom(elevator);
                                    console.log("upQueue\t" + upQueue);
                                    index = upQueue.indexOf(i);
                                    console.log(i+ "\tindex " + index)
                                    if(index != -1){
                                        console.log("added more1");
                                        elevator.destinationQueue.push(upQueue.splice(index, index+1));
                                        allotted++;
                                        elevator.destinationQueue.sort(function(a, b){return a-b});
                                        //elevator.checkDestinationQueue();
                                    }
                                }
                                break;
                            }*/

                        }else{
                            var index = downQueue.indexOf(floorNum);
                            if(index != -1){
                                elevator.goToFloor(floorNum, true);
                                elevator.goingDownIndicator(true);
                                elevator.goingUpIndicator(false);
                                downQueue.splice(index, index+1);
                            }
                            //console.log(space);
                           // console.log("we get here " + space + " allotted " + allotted);
                           /* while(allotted < space){
                                for(var i = floorNum - 1; i > 0; i--){
                                    //space = isThereRoom(elevator);
                                    console.log("downQueue\t" + downQueue);
                                    index = downQueue.indexOf(i);
                                    console.log(i+ "\tindex " + index);
                                    if(index != -1){
                                        console.log("added more");
                                        elevator.destinationQueue.push(upQueue.splice(index, index+1));
                                        allotted++;
                                        elevator.destinationQueue.sort(function(a, b){return a-b}).reverse();
                                        //elevator.checkDestinationQueue();
                                    }//close if
                                }//close for
                                break;
                            }//close while*/
                        }//close else
                    }//close if there is room eval
                    //do nothing(keep on moving) if there is no room
                    elevator.checkDestinationQueue();
                });

                //elevator stopped at a floor find shortest distance in queue
                elevator.on("stopped_at_floor", function(floorNum) {
                    // Maybe decide where to go next?
                    console.log("stopped");
                    process(elevator);
                    if(elevator.destinationQueue.length >= 1){
                        evaluateDirectionIndicator(elevator,elevator.destinationQueue[0]);
                    }else{
                        elevator.goingDownIndicator(true);
                        elevator.goingUpIndicator(true);
                    }
                    elevator.checkDestinationQueue();
                });

            });//close each
        }//close elevatorsRun

        var upQueue = [];
        var downQueue = [];
        console.log("upQueue\t" + upQueue);

        function floorsRun(){
             _.each(floors, function(floor){
                console.log("floors");
                
                floor.on("up_button_pressed", function() {
                    // console.log("paused up");
                    if(!isDestination(floor.level, "up")){//nobodys going there
                        if(upQueue.indexOf(floor.level) === -1){
                            upQueue.push(floor.level);
                            upQueue = upQueue.sort(function(a, b){return a-b});
                        }     
                    }//close if                  
                });

                floor.on("down_button_pressed", function() {
                    if(!isDestination(floor.level, "down")){//nobodys going there
                        if(downQueue.indexOf(floor.level) === -1){
                            downQueue.push(floor.level);
                            console.log("downQueue\t" + downQueue);
                            downQueue = downQueue.sort(function(a, b){return a-b}).reverse();
                            console.log("after sort downQueue\t" + downQueue);
                        }//close if   
                    }//close if  
                });
            });
         }//floorsRun

         function isDestination(floorNum, direction){//return true if an elevator is going there
            _.each(elevators, function(elevator){
                var eleDirection = elevator.destinationDirection();
                if(eleDirection === direction){
                    if(elevator.destinationQueue.indexOf(floorNum) != -1){
                        return true;
                    }//close if
                }//close if
            });//close each
            return false;
         }

         //start this fucker
         floorsRun();
         elevatorsRun();
         

        // Whenever the elevator is idle (has no more queued destinations) ...
    },
        update: function(dt, elevators, floors) {
            // We normally don't need to do anything here
        }
}