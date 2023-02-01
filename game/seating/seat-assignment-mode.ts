/**
 * Determine how seats is assigned to players.
 */
export enum SeatAssignmentMode {
    /**
     * Assign next unoccupied seat to next unassigned player.
     */
    NaturalInsert = 0,
    /**
     * Assign next unoccupied seat to any unassigned player.
     */
    RandomInsert = 1,
    /**
     * Assign next seat to next player
     */
    NaturalOverwrite = 2,
    /**
     * Assign next seat to any unassigned player
     */
    RandomOverwrite = 3,
}
