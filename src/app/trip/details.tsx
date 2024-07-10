import { Text, View } from "react-native";

export function TripDetails({tripId}: {tripId: string}){
  return (
    <View>
      <Text className="text-zinc-50">{tripId}</Text>
    </View>
  )
}