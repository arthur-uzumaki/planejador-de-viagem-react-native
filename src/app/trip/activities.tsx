import { Text, View } from "react-native";
import { TripData } from "./[id]";

interface Props  {
  tripDetails: TripData 
}
export function TripActivities({tripDetails}:Props){
  return (
    <View>
      <Text className="text-zinc-50">{tripDetails.destination}</Text>
    </View>
  )
}