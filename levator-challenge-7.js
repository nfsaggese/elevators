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
    /*
            function normal(){
                console.log("normal");
                checkFloors();
                if((upFloorCallList.length > 0) || (downFloorCallList.length > 0)){
                    var stopped = [];
                    var up = [];
                    var upTotal = [];
                    var down = [];
                    var downTotal = [];
                    for(var x = 0; x < elevators.length; x++){
                        var tempDir = elevators[x].destinationDirection();
                        switch(tempDir){
                            case "up":
                                up.push(x);
                                upTotal = upTotal.concat(elevators[x].destinationQueue);
                                break;
                            case "down":
                                down.push(x);
                                downTotal = downTotal.concat(elevators[x].destinationQueue);
                                break;
                            default:
                                stopped.push(x);
                                break;
                        }//close switch
                    }//close for

              //checkpoint  

                    //cleanse up list
                    if(upTotal.length > 0){
                        for(var i = 0; i < upTotal.length; i++){
                            upFloorCallList = linSearch2(upFloorCallList,upTotal[i]);
                        }//close for
                    }//close if

                    //cleanse down
                    if(downTotal.length > 0){
                        for(var i = 0; i < downTotal.length; i++){
                            downFloorCallList = linSearch2(downFloorCallList,downTotal[i]);
                        }//close for
                    }
    //checkpoint

                    upFloorCallList = upFloorCallList.sort();
                    downFloorCallList = downFloorCallList.sort();
                    up = up.concat(stopped);
                    down = down.concat(stopped);
                    //up direction
                    for(var i = 0; i < upFloorCallList.length; i++){
                       // up = up.concat(stopped);
                        if(up.length > 0){
                            var maxTravel = 0;
                            var difference = 1;
                            for(var k = 0; k < up.length; k++){
                                if(elevators[up[k]].destinationQueue.length < elevators[up[maxTravel]].destinationQueue.length){
                                    difference = Math.abs(elevators[up[k]].destinationQueue.length - elevators[up[maxTravel]].destinationQueue.length);
                                    maxTravel = k;
                                }
                            }
                            for(var k = 0; k < difference; k++){
                                elevators[maxTravel].destinationQueue.push(upFloorCallList[i]);
                                elevators[maxTravel].destinationQueue = elevators[maxTravel].destinationQueue.sort();
                                //elevators[maxTravel].checkDestinationQueue();
                                i++;
                            }
                        }else{
                            var maxTravel = 0;
                            var difference = 1;
                            for(var k = 0; k < down.length; k++){
                                if(elevators[down[k]].destinationQueue.length < elevators[down[maxTravel]].destinationQueue.length){
                                    difference = Math.abs(elevators[down[k]].destinationQueue.length - elevators[up[maxTravel]].destinationQueue.length);
                                    maxTravel = k;
                                }
                            }//close for
                            for(var k = 0; k < difference; k++){
                                elevators[maxTravel].destinationQueue.push(upFloorCallList[i]);
                               // elevators[maxTravel].checkDestinationQueue();
                                i++;
                            }
                        }
                    }//close for

                    for(var i = downFloorCallList.length-1; i > 0; i--){
                       // up = up.concat(stopped);
                        if(down.length > 0){
                            var maxTravel = 0;
                            var difference = 1;
                            for(var k = 0; k < down.length; k++){
                                if(elevators[down[k]].destinationQueue.length < elevators[down[maxTravel]].destinationQueue.length){
                                    difference = Math.abs(elevators[down[k]].destinationQueue.length - elevators[down[maxTravel]].destinationQueue.length);
                                    maxTravel = k;
                                }
                            }
                            for(var k = 0; k < difference; k++){
                                elevators[maxTravel].destinationQueue.push(downFloorCallList[i]);
                                elevators[maxTravel].destinationQueue = elevators[maxTravel].destinationQueue.sort();//need to reverse
                                elevators[maxTravel].destinationQueue = elevators[maxTravel].destinationQueue.reverse();
                            //    elevators[maxTravel].checkDestinationQueue();
                                i--;
                            }
                        }else{
                            var maxTravel = 0;
                            var difference = 1;
                            for(var k = 0; k < down.length; k++){
                                if(elevators[up[k]].destinationQueue.length < elevators[up[maxTravel]].destinationQueue.length){
                                    difference = Math.abs(elevators[up[k]].destinationQueue.length - elevators[up[maxTravel]].destinationQueue.length);
                                    maxTravel = k;
                                }//close if
                            }//close for
                            for(var k = 0; k < difference; k++){
                                elevators[maxTravel].destinationQueue.push(downFloorCallList[i]);
                           //     elevators[maxTravel].checkDestinationQueue();
                                k--;
                            }
                        }
                    }//close for
                    return true;
                }else{
                    return false;
                }
                
            }//close normal

            function linSearch2(master, floorNum){
                for(var i = 0; i < master.length; i++){
                    if(floorNum === master[i]){
                        master = master.splice(i,i+1);
                        return master;//found it
                    }
                }
                //didn't find it
                master.push(floorNum);
                return master;
            }

            function linSearchFloors(master, floorNum){
                for(var i = 0; i < master.length; i++){
                    if(floorNum === master[i]){
                        return master;
                    }
                }
                //didn't find it
                master.push(floorNum);
                return master;
            }*/
            function shortestQueueOrStopped(direction){
                var stopped = [];
                var id = 0;
                for(var x = 0; x < elevators.length; x++){
                    if(elevators[x].destinationQueue.length <= elevators[id].destinationQueue.length){
                        id = x;
                    }
                }//close for
                return id;
            }
                //TupFloorCallList = [];//temp storage for floor lists
                //TdownFloorCallList = [];//temp storage for floor lists
                console.log("checkFloors");
                _.each(floors, function(floor){
                        floor.on("up_button_pressed", function(){
                            var i = shortestQueueOrStopped("up")
                            elevators[i].destinationQueue.push();
                        }),
                        floor.on("down_button_pressed", function(){
                            // Maybe tell an elevator to go to this floor?
                            var i = shortestQueueOrStopped("down")
                            elevators[i].destinationQueue.push();
                            // console.log("floor press up " + floor.level);
                        });
                });
            
        
        },//close init
        update: function(dt, elevators, floors) {
            _.each(elevators, function(elevator){
                elevator.on("floor_button_pressed", function(floorNum){
                    var pressed = elevator.getPressedFloors().sort();
                    var total=0;
                    for(var i = 0; i < pressed.length; i++) {
                        total += pressed[i];
                    }
                    var pressedAvg = total / pressed.length
                    if(pressedAvg < elevator.currentFloor()){
                        pressed = pressed.reverse();
                    }
                    elevator.destinationQueue = pressed.concat(elevator.destinationQueue);
                    //elevator.checkDestinationQueue();
                });//close floors inside evaluator

                elevator.on("idle", function() {
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
                });//close idle*/
            });//close each loop
        
        }//close update
    }