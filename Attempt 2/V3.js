    {
        //issues on: 5, 6,  10-14, 15, 17, 18
        init: function(elevators, floors) {
            var downList = [];
            var upList = [];
            var up = 0;
            var down = 0;

            _.each(floors, function(floor){


                upList.push(0);//initialize the floors arrays for O(1) time cost
                downList.push(0);

                floor.on("up_button_pressed", function() {
                    // Maybe tell an elevator to go to this floor?
                    if(upList[floor.level] === 0){
                        upList[floor.level] = 1;
                        up++
                        
                    }
                    console.log("upList source:   " + upList);
                });

                floor.on("down_button_pressed", function() {
                    // Maybe tell an elevator to go to this floor?
                    if(downList[floor.level] === 0){
                        // console.log("we get here");
                        downList[floor.level] = 1;
                        down++
                        
                    }
                });

            })//close each

            function setDirection(elevator, direction){
                if(direction === "up"){
                    elevator.goingDownIndicator(false);
                    elevator.goingUpIndicator(true);
                }else if(direction === "down"){
                    elevator.goingDownIndicator(true);
                    elevator.goingUpIndicator(false);
                }else{
                    elevator.goingDownIndicator(true);
                    elevator.goingUpIndicator(true);
                }//close else
            }//close setDirection

            function weightFactor(elevator){
                var direction = elevator.destinationDirection();
                
                if(elevator.maxPassengerCount() - (elevator.loadFactor() * elevator.maxPassengerCount()) < 1){
                    /*if(direction === "up"){
                        for(var i = 0; i < elevator.destinationQueue.length; i++){
                            upList[elevator.destinationQueue.splice(i,i+1)] = 1;
                        }
                    }else{//down
                        for(var i = 0; i < elevator.destinationQueue.length; i++){
                            downList[elevator.destinationQueue.splice(i,i+1)] = 1;
                        }
                    }*/
                    return false;
                }else{
                    return true;
                }
            }


            _.each(elevators, function(elevator){
                elevator.on("idle", function(floorNum){
                    // console.log("idle");
                    if(weightFactor(elevator)){
                        process(elevator, elevator.currentFloor());
                    }
                });

                elevator.on("floor_button_pressed", function(floorNum) {
                    // Maybe tell the elevator to go to that floor?
                    if(floorNum >= elevator.currentFloor()){
                        setDirection(elevator, "up");
                        elevator.destinationQueue.push(floorNum);//push floor to the up list

                        if(upList[floorNum] === 1){
                            upList[floorNum] = 0;//remove from uplist.... we are going there
                            up--;
                        }//close if

                        elevator.destinationQueue.sort(function(a, b){return a-b});
                        elevator.checkDestinationQueue();

                    }else{
                        setDirection(elevator, "down")
                        elevator.destinationQueue.push(floorNum);//push floor to the up list

                        if(downList[floorNum] === 1){
                            downList[floorNum] = 0;//remove from uplist.... we are going there
                            down--;
                        }//close if

                        elevator.destinationQueue.sort(function(a, b){return a-b}).reverse();
                        elevator.checkDestinationQueue();
                    }
                });//close floor_button_pressed

                elevator.on("passing_floor", function(floorNum, direction){
                    if(weightFactor(elevator)){
                        if(direction === "up"){
                            if(upList[floorNum] === 1){
                                upList[floorNum] = 0;
                                elevator.goToFloor(floorNum, true);
                            }
                        }else{
                            if(downList[floorNum] === 1){
                                downList[floorNum] = 0;
                                elevator.goToFloor(floorNum, true);
                            }
                        }
                    }//close if
                });

                elevator.on("stopped_at_floor", function(floorNum){
                   /* if(elevator.destinationQueue.length === 0){
                        setDirection(elevator, "none");
                    }else{
                        if(elevator.destinationQueue[0] > floorNum){
                            setDirection(elevator, "up");
                        }else{
                            setDirection(elevator, "down");
                        }//close else     
                    }//close else*/
                });//stopped at floor



            });//each elevator
            function process(elevator, floorNum){
              //  elevator.goToFloor(0);
                setDirection(elevator, "none");
                var flag1 = false;
                var flag2 = false;
                var i = floorNum;
                var j = floorNum;
                var k = 0;
                // console.log(upList + "\tUpList");
                // console.log(downList + "\tDownList");
                while(!(flag1 & flag2)){
                    k++;
                    // console.log("runs while: " + k);
                    // console.log("j:  " + j);
                    // console.log("i:   " + i);
                    console.log(floors.length);
                    if(j < 0){
                        flag2 = true;
                        j = floorNum;
                    }

                    if(i > (floors.length-1)){
                        flag1 = true
                        i = floorNum;
                    }

                    if(flag1 & flag2){
                      //  console.log("going");
                        elevator.goToFloor(0);
                        break;
                    }

                    //end catches
                    var factor = 0;
                    var third = Math.round(floors.length / 4);
                    if(upList[0] === 1){
                        factor +=  Math.round((third / 3));
                        if((floorNum-third) <= 0){
                            factor += third;
                        }
                    }
                    

                    if((up + factor) > down){
                        if((upList[i] != 0) || (upList[j] != 0)){
                            if(upList[i] != 0){
                                upList[i] = 0;
                                setDirection(elevator, "up");
                                console.log("up " + i);
                                elevator.destinationQueue.push(i);
                                elevator.destinationQueue.sort(function(a,b){return a-b});//get enroute dests as well wasting moves
                                elevator.checkDestinationQueue();
                                up--;
                                extendProcess(elevator, i, "up");
                                break;
                            }else{//j
                                upList[j] = 0;
                                setDirection(elevator, "up");
                                console.log("up " + j);
                                elevator.destinationQueue.push(j);
                                elevator.destinationQueue.sort(function(a,b){return a-b});
                                elevator.checkDestinationQueue();
                                up--;
                                
                                extendProcess(elevator, j, "up");
                                break;
                            }//close else
                        }else{
                            i++;
                            j--;
                            continue;
                        }//close else
                    }else{
                        if((downList[i] != 0) || (downList[j] != 0)){
                            if(downList[i] != 0){
                                downList[i] = 0;
                                setDirection(elevator, "down");
                                console.log("down " + i);
                                elevator.destinationQueue.push(i);
                                elevator.destinationQueue.sort(function(a,b){return a-b}).reverse();
                                elevator.checkDestinationQueue();
                                down--;
                                
                                extendProcess(elevator, i, "down");
                                break;
                            }else{//j
                                downList[j] = 0;
                                setDirection(elevator, "down");
                                console.log("down " + j);
                                elevator.destinationQueue.push(j);
                                elevator.destinationQueue.sort(function(a,b){return a-b}).reverse();
                                elevator.checkDestinationQueue();
                                
                                down--;
                                extendProcess(elevator, j, "down");
                                break;
                            }//close else
                        }else{
                            i++;
                            j--;
                            continue;
                        }//close else
                    }//close else
                    
                }//close while
                // if(elevator.destinationQueue.length === 0){
                //     elevator.goToFloor(0);
                // }
            }//close process

            function extendProcess(elevator, startFloor, direction){
                if(direction === "up"){
                    // var i = startFloor++;
                    for(var i = startFloor++; i < floors.length; i++){
                        if(!weightFactor(elevator)){
                            break;
                        }//close if

                        if(upList[i] === 1){
                            upList[i] = 0;
                            elevator.destinationQueue.push(i);
                            elevator.destinationQueue.sort(function(a,b){return a-b});
                            elevator.checkDestinationQueue();
                            up--;
                            
                        }//close if
                    }//close for
                }else{
                    for(var i = startFloor--; i > 0; i--){
                        if(!weightFactor(elevator)){
                            break;
                        }//close if

                        if(downList[i] === 1){
                            downList[i] = 0;
                            elevator.destinationQueue.push(i);
                            elevator.destinationQueue.sort(function(a,b){return a-b}).reverse();
                            elevator.checkDestinationQueue();
                            down--;
                            
                        }//close if
                    }//close for
                }//close else            
            }//close extendProcess

        },
        update: function(dt, elevators, floors) {
            // We normally don't need to do anything here
        }
    }