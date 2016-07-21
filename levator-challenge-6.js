{
    //this is an obj with function declarations
    init: function(elevators, floors) {
        var upFloorCallList = [];
        var downFloorCallList = [];
        var numFloors = floors.length;
        var midFloor = Math.round(numFloors / 2);//midpoint floor
        var topFloor = numFloors - 1;

        //check if any elevator is on this floor
        function isAnybodyThere(floorNum){
            //console.log("isAnybodyThere");
            _.each(elevators, function(elevator){
                if(elevator.currentFloor() === floorNum){
                    return true;//return true if we got the floor
                }//close if
            });//close each
            return false;
        }

        //see how many elevators are on this floor
        function howManyAreThere(floorNum){
            //console.log("howManyAreThere");
            var z = 0;
            _.each(elevators, function(elevator){
                if(elevator.currentFloor() === floorNum){
                    z+= 1;
                }//close if
            });//close each
            return z;
        }

        //need a way to evaluate both lists in real time and update the dest list
        function checkInside(elevator){
                //.log("checkInside");
                var insideFloors = elevator.getPressedFloors();//queued floors inside elevator
                insideFloors = insideFloors.sort();
                return insideFloors;
        }//close checkInside
        
        function isAnybodyElseGoingThere(floorNum, distance, direction){
            //console.log("isanybodyElseGoingThere");
            //true if another elevator is going there
            var flag11 = false;
            _.each(elevators, function(elevator){
                if(elevator.destinationQueue.length > 0){
                    if(elevator.destinationDirection() === direction){
                        //remove from the other queue
                        var index = _.indexOf(elevator.destinationQueue, floorNum);//find index of floornum in queue or -1 if it isn't there
                        if((index <= distance)  && (index != -1)){
                            flag11 = true;
                        }
                    }
                }
            });
            //will return false nobody is going there within i queue positions
            return flag11;
        }//close isanybodyElseGoingThere

        //CHECKPOINT A

        function normal(){
            //console.log("normal");
            //sort masters
            upFloorCallList = upFloorCallList.sort();
            downFloorCallList = downFloorCallList.sort();
            _.each(elevators, function(elevator){
                var tempDestQueue = [];
                var currentFloor = elevator.currentFloor();//current floor
                if((upFloorCallList.length > 0) || (downFloorCallList.length > 0)){ //POSSIBLE
                    var direction = elevator.destinationDirection();
                    //decide a direction optimally
                    //checking up direction
                    if((direction === "up") || (direction === "down")){
                        //do nothing just see what to add on the way in the next section
                    }else{
                        var above = topFloor - currentFloor;
                        var below = currentFloor;//this number - 0 is the distance to floor
                        var aboveCount = 0;
                        var belowCount = 0;
                        
                        for(var i = 0; i < upFloorCallList.length; i+= 1){
                            if(upFloorCallList[i] > currentFloor){
                                aboveCount+= 1;
                            }//close if
                        }//close for
                        //checking down direction now
                        for(var i = (downFloorCallList.length-1); i > 0; i--){
                            if(downFloorCallList[i] < currentFloor){
                                belowCount+= 1;
                            }//close if
                        }
                        //check if counts are still zero prevents divide by zero errors
                        if(aboveCount === 0){
                            direction = "down";
                        }else if(belowCount === 0){
                            direction = "up";
                        }else{
                            //simple calc determines ratio of requested floors to space...ie primitive speed/efficiency calc
                            var aboveToCount = above / aboveCount;
                            var belowToCount = below / belowCount;

                            //lower is better
                            if(aboveToCount < belowToCount){
                                direction = "up";
                            }else{
                                direction = "down";
                            }//close else
                        }//close else
                    }//close else
                    if(direction === "up"){
                        
                        for(var i = 0; i < upFloorCallList.length; i+= 1){//check to see if there are any pressed floors(outside) in the direction we are going but ahead of us...list is presorted
                            if(upFloorCallList[i] > currentFloor){//add all the current                                
                                for(var j = i; j < upFloorCallList.length; j+= 1){
                                    tempDestQueue.push(upFloorCallList[j]);
                                    upFloorCallList.splice(j,j+1);//removes aas they are added to dest
                                }//close for
                                break;//we have them all in the temp dest queue
                            }//close if
                        }//close for
                    }else{//direction is down
                        for(var i = (downFloorCallList.length-1); i > 0; i--){//check to see if there are any pressed floors(outside) in the direction we are going but ahead of us...list is presorted
                            if(downFloorCallList[i] < currentFloor){//add all the current
                                for(var j = i; j > 0; j--){
                                    tempDestQueue.push(downFloorCallList[j]);
                                    downFloorCallList.splice(j,j+1);//removes as they are added to dest
                                }//close for
                                break;//we have them all in the temp dest queue
                            }//close if
                        }//close for
                    }//close else
                    //process the tempDestQueue
                    tempDestQueue = tempDestQueue.sort();//sort least to greatest
                    if(direction = "up"){
                        
                        for(var i = 0; i < tempDestQueue.length; i+= 1){
                            //we need a way to check other elevators to see if they are going there....
                            //direction must be taken into accoutn and length of destination queue,
                            //no more than i, ensures that queues don't get too big
                            if(!isAnybodyElseGoingThere(tempDestQueue[i], i, direction)){
                                elevator.destinationQueue.push(tempDestQueue[i]);
                            }
                        }//close for
                    }else{
                        
                        for(var i = tempDestQueue.length-1; i > 0; i--){//opposite direction for down
                            //we need a way to check other elevators to see if they are going there....direction must be taken into account and length of destination queue, no more than i
                            if(!isAnybodyElseGoingThere(tempDestQueue[i], i, direction)){
                                elevator.destinationQueue.push(tempDestQueue[i]);
                            }
                        }
                    }

                    tempDestQueue = [];
                    elevator.checkDestinationQueue();//get it moving
                    //set arrows
                    direction = elevator.destinationDirection();
                    if(direction = "up"){
                        if(!elevator.goingUpIndicator()) {
                            elevator.goingDownIndicator(true);
                        }
                    }else{
                        if(!elevator.goingDownIndicator()) {
                            elevator.goingUpIndicator(true);
                        }
                    }//done with adjusting arrows
                    //move on now and repeat!
                    return true;
                }else{
                    return false;
                }
            });//close each
        }//close normal

        //CHECKPOINT B
        //this is now good
        function linSearchFloors(master, floorNum){
            for(var i = 0; i < master.length; i++){
                if(floorNum === master[i]){
                    return master;
                }
            }
            //didn't find it
            master.push(floorNum);
            return master;
        }
        function bsFloors(master, floorNum){//binary search of the floors against pending list
            //console.log("bsFloors");
            var left = 0;
            var right = master.length - 1;
            var mid = Math.round((left + right) / 2)//find midpoint
            master = master.sort();

            //boundary catch
            if((master[left] > floorNum) || (master[right] < floorNum)){
                master.push(floorNum);//added it to the master
                console.log("boundary catch - bsFloors");
                return master;
            }//close if

            // console.log("i: " + i);
            // console.log("tempList " + tempList.valueOf());
            // console.log("master " + master.valueOf());
            // console.log("left " + left +"- right " + right + "-mid " + mid + "-midVal " + master[mid] + "-value " + tempList[i]);

            while(true){
                if(Math.abs(left - right) <= 1){
                    //r = mid catch, fixes a rounding error
                    console.log("r=mid catch");
                    switch(floorNum){
                        case master[left]:
                            return master;
                            break;//found it
                        case master[right]:
                            return master;
                            break;//found it
                        default:
                            //didnt find it
                            master.push(floorNum);//added it to the master
                            return master;
                    }//close switch
                }//close if statment

                mid = Math.round((left + right) / 2)//find midpoint
                //console.log("mid" + mid);
                if(left > right){
                    master.push(tempList[i]);//added it to the master
                    return master;
                }else if(master[mid] === floorNum){
                    return master;//we found it
                }else if(master[mid] < floorNum){
                    //console.log("left1: " + left);
                    left = mid;
                    continue;//keep searching
                }else if(master[mid] > floorNum){
                    //console.log("right1: " + right);
                    right = mid;
                    continue;//keep searching
                }
            }//close while loop
            //console.log("two");
        }//close bsFloors
        
        function checkFloors(){
            //TupFloorCallList = [];//temp storage for floor lists
            //TdownFloorCallList = [];//temp storage for floor lists
            console.log("checkFloors");
            _.each(floors, function(floor){
                //console.log("ran this: " + (j+= 1))   //NOT DECLARED ERROR
                //event listeners cant modify variables
                if(upFloorCallList.length != numFloors){
                    floor.on("up_button_pressed", function(){
                        // Maybe tell an elevator to go to this floor?
                        console.time('linSearchFloors');
                        upFloorCallList = linSearchFloors(upFloorCallList, floor.level);
                        console.timeEnd('linSearchFloors');
                        // console.log("floor press up " + floor.level);
                    });
                }

                if(downFloorCallList.length != numFloors){
                    floor.on("down_button_pressed", function(){
                        // Maybe tell an elevator to go to this floor?
                        console.time('bsFloors');
                        downFloorCallList = linSearchFloors(downFloorCallList, floor.level); 
                        console.time('bsFloors');
                        // console.log("floor press up " + floor.level);
                    });
                }

            });
        }//close checkFloors
        // Whenever an elevator is idle (has no more queued destinations) ...
        _.each(elevators, function(elevator){
            elevator.on("floor_button_pressed", function(floorNum){
                elevator.destinationQueue.push(floorNum);
                elevator.checkDestinationQueue();
            });
            elevator.on("idle", function() {
                    if(elevator.destinationDirection() === "stopped"){
                        if(!isAnybodyThere(0)){//is anybody on the bottom, we want to know if they aren't there so we can send an idle elevator
                            elevator.goToFloor(0);
                        }else if(!isAnybodyThere(midFloor)){//how about the middle?
                            elevator.goToFloor(midFloor);
                        }else if(!isAnybodyThere(topFloor)){
                            elevator.goToFloor(topFloor);
                        }else{
                            //how many on each
                            //how to sort array of objects in js?
                            var bottomcount = howManyAreThere(0);
                            var midcount = howManyAreThere(midFloor);
                            var topcount = howManyAreThere(topFloor);
                            if(bottomcount < midcount){
                                if(bottomcount < topcount){
                                    //bottom is least
                                    elevator.goToFloor(0);
                                }else{
                                    //top is least
                                    elevator.goToFloor(topFloor);
                                }
                            }else if(bottomcount < topcount){
                                //mid is least
                                elevator.goToFloor(midFloor);
                            }else{
                                if(midcount < topcount){
                                    //mid is least
                                    elevator.goToFloor(midFloor);
                                }else{
                                    //top is least
                                    elevator.goToFloor(topFloor);
                                }
                            }//close else
                        }//close else
                    }//close else
            });
        });
    
    },//close init
    update: function(dt, elevators, floors) {
    }//close update
}