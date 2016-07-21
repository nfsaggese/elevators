{
    //api driven approach...will optimize after every function is accounted for
    init: function(elevators, floors) {
        var numFloors = floors.length-1;
        var midFloor = Math.round(numFloors / 2);//midpoint floor
        var topFloor = numFloors - 1;
        var distributeFlag = false;
        console.log(midFloor);
        //get elevator capicities
        var weightCalc = false;
        var elevatorWeights = [];

        if(weightCalc === false){
            getCapacities();
            weightCalc = true;
        }//close if
        function getCapacities(){
            for(var i = 0; i < elevators.length; i++){
                elevatorWeights[i] = elevators[i].maxPassengerCount();
            }//close for   
        }//close getCapacities

        function distribute(elevator){
            console.log('distribute');
            if(distributeFlag){
                elevator.destinationQueue.push(midFloor);
            }else{
                elevator.destinationQueue.push(0);
            }
            distributeFlag = !distributeFlag;
            //set indicators to stopped
            elevator.goingUpIndicator(true);
            elevator.goingDownIndicator(true);
        }//close distribute

        function isDestination(queue,floorNum){
            return queue.indexOf(floorNum);
        }
        function evaluateDirectionIndicator(elevator, destination){
            if(elevator.currentFloor() > destination){
                elevator.goingDownIndicator(true);
                elevator.goingUpIndicator(false);
            }else if(elevator.currentFloor() < destination){
                elevator.goingDownIndicator(false);
                elevator.goingUpIndicator(true);
            }else{
                elevator.goingDownIndicator(false);
                elevator.goingUpIndicator(false);
            }
        }

        function elevatorsRun(){
            _.each(elevators, function(elevator){

                console.log("elevators");
                //if(elevator)
                elevator.on("idle", function() {
                    console.log("idle");
                    var tempUp = isDestination(upQueue,elevator.currentFloor);
                    var tempDown = isDestination(downQueue,elevator.currentFloor);
                    if(tempUp != -1){
                        console.log("up idle");
                        elevator.goingUpIndicator(true);
                        elevator.goingDownIndicator(false);
                        upQueue.splice(tempUp, tempUp+1)
                    }else if(tempDown != -1){
                        console.log("down idle");
                        elevator.goingDownIndicator(true);
                        elevator.goingUpIndicator(false);
                        downQueue.splice(tempDown, tempDown+1);
                    }else{
                        elevator.goingDownIndicator(true);
                        elevator.goingUpIndicator(true);
                    }
                    longerQueue(elevator);

                });

                //inner elevator button pressed
                elevator.on("floor_button_pressed", function(floorNum) {
                    if(elevator.destinationQueue.length === 0){
                        evaluateDirectionIndicator(elevator,floorNum);
                    }     
                    elevator.destinationQueue.push(floorNum);
                    elevator.checkDestinationQueue();
                });
                //elevator is passing a floor is it in our queues?
                elevator.on("passing_floor", function(floorNum, direction) {
                    console.log("passing\t" + floorNum + " direction\t" + direction);
                    if(direction === "up"){
                        elevator.goingDownIndicator(false);
                        elevator.goingUpIndicator(true);
                        console.log("upQueue\t" + upQueue);
                        var index = isDestination(upQueue, floorNum);
                        if(index >= 0){
                            elevator.goToFloor(floorNum);
                            console.log("sent");
                            upQueue.splice(index, index+1);
                            //removed and sent
                        }else{
                            var tempIndex = elevator.destinationQueue.indexOf(floorNum);
                            if(elevator.destinationQueue.indexOf(floorNum) != -1){
                                elevator.stop()
                                elevator.destinationQueue.splice(tempIndex,tempIndex+1);
                            }
                        }
                    }else{
                        elevator.goingDownIndicator(true);
                        elevator.goingUpIndicator(false);
                        console.log("downQueue\t" + downQueue);
                        var index = isDestination(downQueue, floorNum);
                        if(index >= 0){
                            elevator.goToFloor(floorNum);
                            console.log("sent");
                            downQueue.splice(index, index+1);
                            //removed and sent
                        }else{
                            var tempIndex = elevator.destinationQueue.indexOf(floorNum);
                            if(elevator.destinationQueue.indexOf(floorNum) != -1){
                                elevator.stop()
                                elevator.destinationQueue.splice(tempIndex,tempIndex+1);
                            }
                        }
                    }
                });

                //elevator stopped at a floor find shortest distance in queue
                elevator.on("stopped_at_floor", function(floorNum) {
                    // Maybe decide where to go next?
                    console.log("stopped");
                    elevator.checkDestinationQueue();

                })

            });
        }//close elevatorsRun
        

        var upQueue = [];
        var downQueue = [];

        //return floors in an array that are to be visited
        function longerQueue(elevator){
            console.log("up\t" + upQueue);
            console.log("down\t" + downQueue);
            var direction;
            function avgDestQueue(){
                var sum = 0;
                for(var i = 0; i < elevators.length; i++){
                    sum += elevators[i].destinationQueue.length;
                }//close for
                var avg = Math.round(sum / elevators.length);
                if(avg > 0){
                    return avg;
                }else{
                    return 1;
                }
            }//close avgDestQueue;
            function assembleClosestValues(floorNum,queue,difference){
                var answerIndices = [];
                // console.log("difference\t" + difference);
                // console.log("floorNum\t" + floorNum);
                // console.log("queue\t" + queue);
                var index = findClosestValue(floorNum, queue);
                var floorNumTemp = queue[index];//redefine floornum
                
                if(floorNumTemp > floorNum){
                    direction = "up"
                }else{
                    direction = "down"
                }
                floorNum = queue[index];//redefine floornum
                answerIndices.push(queue.splice(index, index+1));//redefine queue
                //catch if avg is longer than available
                if(difference > queue.length){
                    difference = queue.length;
                }
                for(var i = 1; i < difference; i++){
                    var index = findClosestValue(floorNum, queue, direction);
                    if(index === -1){
                        break;
                    }
                    floorNum = queue[index];//redefine floornum
                    answerIndices.push(queue.splice(index, index+1));//redefine queue
                }//close for
                // console.log("answerIndices\t" + answerIndices);
                return answerIndices;
            }//close assembleClosestValues

            function findClosestValue(floorNum,queue,direction){
                if(direction === undefined){
                    direction = "unknown";
                }

                var dif = Math.abs(floorNum - queue[0]);
                var closest = 0;
                //evaluate if there are others in that direction, get out if not
                if((direction === "up" ) || (direction ==="down")){
                    closest = -1;
                    for(var i = 0; i < queue.length; i++){
                        if(direction === "up"){
                            if(queue[i] > floorNum){
                                closest = i;
                                break;
                            }
                        }else{
                            if(queue[i] < floorNum){
                                closest = i;
                                break;
                            }
                        }
                    }//close for
                    if(closest === -1){
                        return -1;
                    }
                }//close if
                
                for(var i = 0; i < queue.length; i++){
                    var tempDif = Math.abs(queue[i] - floorNum);
                    
                    if(direction === "up"){
                        if(queue[i] < floorNum){
                            continue;
                        }
                    }
                    if(direction === "down"){
                        if(queue[i] > floorNum){
                            continue;
                        }
                    }

                    if(tempDif < dif){
                        closest = i;
                    }//close if
                }//close for
                return closest;
            }//close findClosestValue
            // console.log("two");

            //for idle
            var differenceArray = [];

            if((upQueue.length === 0) && (downQueue.length === 0)){
                // console.log("does enter");
               // distribute(elevator);
                elevator.checkDestinationQueue();
                direction = elevator.destinationDirection();
                /*if(direction === "down"){
                    elevator.goingDownIndicator(true);
                    elevator.goingUpIndicator(false);
                }else{
                    elevator.goingDownIndicator(false);
                    elevator.goingUpIndicator(true);
                }*/
                return;
                // console.log("does not exit");
            }

            var difference = Math.abs(upQueue.length - downQueue.length);
            if(difference === 0){
                var index = findClosestValue(elevator.currentFloor(),upQueue);
                return upQueue.splice(index, index+1);
            }
            // console.log("two - 2");
            //find closest avg to floor num of elevator for # of items(difference)
            difference = avgDestQueue();

            if(upQueue.length > downQueue.length){
                // console.log("three -1");
                differenceArray = assembleClosestValues(elevator.currentFloor(),upQueue,difference);
            }else{
                // console.log("three - 2");
                // console.log("downQueue\t" + downQueue);
                differenceArray = assembleClosestValues(elevator.currentFloor(),downQueue,difference);
                // console.log("downQueue\t" + downQueue);
            }//close else
            // console.log("differenceArray\t" + differenceArray);
            elevator.destinationQueue = elevator.destinationQueue.concat(differenceArray);
            elevator.checkDestinationQueue();
           /* direction = elevator.destinationDirection();
            if(direction === "down"){
                elevator.goingDownIndicator(true);
                elevator.goingUpIndicator(false);
            }else{
                elevator.goingDownIndicator(false);
                elevator.goingUpIndicator(true);
            }*/
        }

        function shortestElevator(){
            var shortest = 0;
            for(var i = 0; i < elevators.length; i++){
                if(elevators[i].destinationQueue.length < elevators[shortest].destinationQueue.length){
                    shortest = i;
                }
            }//close for
            console.log("shortest\t" + shortest);
            return elevators[shortest];
        }

        function floorsRun(){
             _.each(floors, function(floor){
                console.log("floors");
                
                floor.on("up_button_pressed", function() {
                    // console.log("paused up");
                    if(isDestination(upQueue,floor.level) < 0){
                        upQueue.push(floor.level);
                        var elevator = shortestElevator();
                        //longerQueue(elevator);
                        console.log("process up");
                    }
                    console.log("up\t" + upQueue);
                    console.log("down\t" + downQueue);
                    
                });

                floor.on("down_button_pressed", function() {
                    // console.log("pushed down");
                    if(isDestination(downQueue,floor.level) < 0){
                        downQueue.push(floor.level);
                        var elevator = shortestElevator();
                        //longerQueue(elevator);
                        console.log("process down");
                    }
                    console.log("up\t" + upQueue);
                    console.log("down\t" + downQueue);
                });
            });
         }//floorsRun

         floorsRun();
         elevatorsRun();
         /*while(true){
            longerQueue();
         }*/
         

        // Whenever the elevator is idle (has no more queued destinations) ...
    },
        update: function(dt, elevators, floors) {
            // We normally don't need to do anything here
        }
}