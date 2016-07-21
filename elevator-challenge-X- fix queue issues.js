{
    //api driven approach...will optimize after every function is accounted for
    init: function(elevators, floors) {
        var numFloors = floors.length-1;
        var midFloor = Math.round(numFloors / 2);//midpoint floor
        var topFloor = numFloors - 1;
        var distributeFlag = true;
        console.log(midFloor);
        

        function distribute(elevator){
            console.log('distribute');
            if(distributeFlag){
                elevator.destinationQueue.push(midFloor);
            }else{
                elevator.destinationQueue.push(0);
            }
            distributeFlag = !distributeFlag;
            elevator.checkDestinationQueue();
            //set indicators to stopped
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

        function elevatorsRun(){
            _.each(elevators, function(elevator){

                console.log("elevators");
                //if(elevator)
                elevator.on("idle", function() {
                    console.log("upQueue\t" + upQueue);
                    console.log("idle");
                    elevator.goingUpIndicator(true);
                    elevator.goingDownIndicator(true);
                    if(checkLengths()){
                        console.log("elevator stuck\t" + elevator);
                    }else{
                        distribute(elevator);
                    }

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
                    elevator.checkDestinationQueue();
                });

                //elevator is passing a floor is it in our queues?
                elevator.on("passing_floor", function(floorNum, direction) {
                    elevator.destinationQueue.sort(function(a, b){return a-b});
                    if(direction == "up"){
                        elevator.goingDownIndicator(false);
                        elevator.goingUpIndicator(true);
                    }else{//down
                        elevator.destinationQueue.reverse();
                        elevator.goingDownIndicator(true);
                        elevator.goingUpIndicator(false);
                    }//close else
                    var allotted = 0;
                    var space = isThereRoom(elevator);
                    if(space >= 1){
                        if(direction === "up"){
                            var index = upQueue.indexOf(floorNum);
                            if(index != -1){
                                var tempQueue = [floorNum];
                                elevator.destinationQueue = tempQueue.concat(elevator.destinationQueue);
                                allotted++;
                                console.log("stopped here- " + floorNum);
                                //set indicator
                                elevator.checkDestinationQueue();
                                elevator.goingUpIndicator(true);
                                elevator.goingDownIndicator(false);
                                upQueue.splice(index, index+1);
                            }
                            while(space >= 1){
                                for(var i = elevator.currentFloor + 1; i < floors.length; i++){
                                    space = isThereRoom(elevator);
                                    index = upQueue.indexOf(i);
                                    if(index != -1){
                                        elevator.destinationQueue.push(upQueue.splice(index, index+1));
                                        allotted++;
                                        elevator.destinationQueue.sort(function(a, b){return a-b});
                                        elevator.checkDestinationQueue();
                                    }
                                }
                                break;
                            }

                        }else{
                            var index = downQueue.indexOf(floorNum);
                            if(index != -1){
                                var tempQueue = [floorNum];
                                elevator.destinationQueue = tempQueue.concat(elevator.destinationQueue);
                                allotted++;
                                console.log("stopped here2- " + floorNum);
                                //set indicator
                                elevator.checkDestinationQueue();
                                elevator.goingDownIndicator(true);
                                elevator.goingUpIndicator(false);
                                downQueue.splice(index, index+1);
                            }

                            while(allotted < space){
                                for(var i = (floors.length - 1); i > elevator.currentFloor; i--){
                                    space = isThereRoom(elevator);
                                    index = downQueue.indexOf(i);
                                    if(index != -1){
                                        elevator.destinationQueue.push(upQueue.splice(index, index+1));
                                        allotted++;
                                        elevator.destinationQueue.sort(function(a, b){return a-b}).reverse();
                                        elevator.checkDestinationQueue();
                                    }//close if
                                }//close for
                                break;
                            }//close while
                        }//close else
                    }//close if there is room eval
                    //do nothing(keep on moving) if there is no room
                });

                //elevator stopped at a floor find shortest distance in queue
                elevator.on("stopped_at_floor", function(floorNum) {
                    // Maybe decide where to go next?
                    console.log("stopped");
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