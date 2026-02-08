import PocketBase from "pocketbase";

//indirizzo di localhost
//Per andare su pockethost: http://raspberrypi:8091/_/
const pb = new PocketBase("http://raspberrypi:8091");

export default pb;
