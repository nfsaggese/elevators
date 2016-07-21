{
    init: function(elevators, floors) {
        var elevator = elevators[0]; // Let's use the first elevator

        // Whenever the elevator is idle (has no more queued destinations) ...
        elevator.on("idle", function() {
        });
    },
    update: function(dt, elevators, floors) {
        function findPos(master, floorNum){
            for(var i = 0; i < master.length; i++){
                if(floorNum > master[i]){
                    return i;
                }
            }
            return -1;
        }
         _.each(elevators, function(elevator){
            elevator.destinationQueue = elevator.getPressedFloors().concat(elevator.destinationQueue);
        })
        elevator.destinationQueue = elevator.destinationQueue.sort();


    }//close update
}