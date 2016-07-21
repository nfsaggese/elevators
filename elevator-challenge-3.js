{
    init: function(elevators, floors) {
        var elevator = elevators[0]; // Let's use the first elevator
        var upFloorCallList;
        var downFloorCallList;
        function doublePassCheckFloors(floor){
            upCheck(floor);
            downCheck(floor);
        }
        function upCheck(floor){
            floor.on("up_button_pressed", function() {
                // Maybe tell an elevator to go to this floor?
                upFloorCallList.push(floor.floorNum);
                console.log("floor press up " + floor.floorNum);
            })  
        }
        function downCheck(floor){
            floor.on("down_button_pressed", function() {
                downFloorCallList.push(floor.floorNum);
                console.log("floor press down " + floor.floorNum);
            })
        }
        function checkFloors(floors){
            upFloorCallList = [];
            downFloorCallList = [];
            for(var i = 0; i < floors.length; i++){
                //console.log(i);
                doublePassCheckFloors(floors[i]);               
            }//close for
        }//close checkFloors
        // Whenever the elevator is idle (has no more queued destinations) ...
        elevator.on("idle", function() {
            // let's go to all the floors (or did we forget one?)
            checkFloors(floors);
        });
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}