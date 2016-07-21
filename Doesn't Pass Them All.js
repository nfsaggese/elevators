{
    //borrows from provided solutions
    //NEVER SORT
    init: function(elevators, floors) {
        var numFloors = floors.length-1;
        var midFloor = Math.round(numFloors / 2);//midpoint floor
        var topFloor = numFloors - 1;
        var distributeFlag = true;
        console.log(midFloor);

        function isDestination(elevator, floorNum, direction){//polymorphic!
            if(direction === undefined){
                return (elevator.destinationQueue.indexOf(floorNum) != -1);//returns true if it is a dest
            }else{
                var index = elevator.destinationQueue.indexOf(floorNum);
                if(index === -1){
                return false;
                }else{
                    if(direction === "up"){
                        if(elevator.destinationQueue[index-1] < elevator.destinationQueue[index]){
                           return true; 
                        }else{
                            return false;
                        }//close else
                    }else{
                       if(elevator.destinationQueue[index-1] > elevator.destinationQueue[index]){
                           return true; 
                        }else{
                            return false;
                        }//close else
                    }//close else
                }//close else
            }//close else
            
        }//close isDestination

        function avgQueue(){
            var sum = 0;
            for(var i = 0; i < elevators.length; i++){
                sum += elevators[i].destinationQueue.length;
            }
            return Math.ceil(sum / elevators.length);
        }

        _.each(elevators, function(elevator) {  

            elevator.on("floor_button_pressed", function(floorNum) {
                if (!isDestination(elevator,floorNum)){
                   /* if(elevator.currentFloor() > floorNum){//DOWN
                        elevator.goingDownIndicator(true);
                        elevator.goingUpIndicator(false);
                    }else{
                        elevator.goingDownIndicator(false);
                        elevator.goingUpIndicator(true);
                    }*/
                    elevator.goToFloor(floorNum);
                }
            });
            elevator.on("idle", function(){
             /*   var floorNum = elevator.currentFloor();
                if(floorNum === 0){
                    elevator.goingDownIndicator(false);
                    elevator.goingUpIndicator(true);
                }else if(floorNum === topFloor){
                    elevator.goingDownIndicator(true);
                    elevator.goingUpIndicator(false); 
                }else{
                    elevator.goingDownIndicator(true);
                    elevator.goingUpIndicator(true);
                }//close else*/
            });
            elevator.on("stopped_at_floor", function(floorNum) {
                /*if(floorNum === 0){
                    elevator.goingDownIndicator(false);
                    elevator.goingUpIndicator(true);
                }
                if(floorNum === topFloor){
                    elevator.goingDownIndicator(true);
                    elevator.goingUpIndicator(false); 
                }*/
            });
            //CHECK IF WE CAN ADD ON FOR OTHER ELEVATORS THAT ALSO HAVE THE SAME DIRECTION
            elevator.on("passing_floor", function(floorNum, direction) {
                /*if(direction == "up"){
                    elevator.goingDownIndicator(false);
                    elevator.goingUpIndicator(true);
                }else{//down
                    elevator.goingDownIndicator(true);
                    elevator.goingUpIndicator(false);
                }//close else*/

                if (isDestination(elevator,floorNum)) {
                    elevator.destinationQueue = elevator.destinationQueue.filter(function(f) { return f != floorNum; });//filters out floorNum from dest queue
                    elevator.goToFloor(floorNum, true);
                }
            });
        });
            
        _.each(floors, function(floor){
            floor.on("up_button_pressed", function() {
                if (elevators.some(function(elevator) {
                    return isDestination(elevator, floor.floorNum(), "up");
                })){
                    return;
                }else{
                    
                   var elevator = elevators[0];
                    var avg = avgQueue();
                    for(var i = 0; i < elevators.length; i++){
                        if (elevators[i].destinationQueue.length <= avg){
                            var diff = Math.abs(floor.floorNum() - elevators[i].destinationQueue[elevators[i].destinationQueue.length - 1]);
                            var diffChamp = Math.abs(floor.floorNum() - elevator.destinationQueue[elevator.destinationQueue.length - 1]);
                            if(diff < diffChamp){
                               elevator = elevators[i]; 
                            } 
                        }
                    }
                    
                    if (!isDestination(elevator, floor.floorNum())){
                        elevator.goToFloor(floor.floorNum());
                    }
                }//close else
            });
            floor.on("down_button_pressed", function() {
                if (elevators.some(function(elevator) {
                    return isDestination(elevator, floor.floorNum(), "down");
                })){
                    return;
                }else{
                    
                    var elevator = elevators[0];
                    var avg = avgQueue();
                    console.time("stupid")
                    for(var i = 0; i < elevators.length; i++){
                        if (elevators[i].destinationQueue.length <= avg){
                            var diff = Math.abs(floor.floorNum() - elevators[i].destinationQueue[elevators[i].destinationQueue.length - 1]);
                            var diffChamp = Math.abs(floor.floorNum() - elevator.destinationQueue[elevator.destinationQueue.length - 1]);
                            if(diff < diffChamp){
                               elevator = elevators[i]; 
                            } 
                        }
                    }
                    console.timeEnd("stupid");
                    if (!isDestination(elevator, floor.floorNum())){
                        elevator.goToFloor(floor.floorNum());
                    }
                }//close else
            });
        });
    },
    update: function(dt, elevators, floors) { }
}