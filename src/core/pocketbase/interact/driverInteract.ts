import pb from "../connection";


export async function getFullListDrivers() {
    const result = await pb.collection("drivers").getFullList();
    return result;
}

export async function getDriversByTeam(teamId: string) {
    const result = await pb.collection("drivers").getFullList({
        filter: `teamId = "${teamId}"`
    });
    return result;
}

export async function getDriverById(driverId: string) {
    const result = await pb.collection("drivers").getOne(driverId);
    return result;
}

export default {
    getFullListDrivers,
    getDriversByTeam,
    getDriverById
}