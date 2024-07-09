import { Text, View } from "react-native";
import clsx from "clsx";
import { CircleCheck, CircleDashed } from "lucide-react-native";
import { colors } from "@/styles/colors";

export interface ActivityProps {
  id: string
  title: string
  hour: string
  isBefore: boolean
}

interface Props {
  data: ActivityProps
}

export function Activity({ data }: Props) {

  return (
    <View
      className={clsx(
        'w-full bg-zinc-900 px-4 py-3 rounded-lg flex-row items-center border border-zinc-800 gap-3',
        { "opacity-50": data.isBefore }
      )}
    >
      {data.isBefore ? (
        <CircleCheck
          size={20}
          color={colors.lime[300]}
        />
      ) : (
        <CircleDashed
          color={colors.zinc[400]}
          size={20}
        />
      )}

      <Text className="text-zinc-100 font-regular text-base flex-1">
        {data.title}
      </Text>

      <Text className="text-zinc-400 font-regular text-sm">
        {data.hour}
      </Text>
    </View>
  )

}