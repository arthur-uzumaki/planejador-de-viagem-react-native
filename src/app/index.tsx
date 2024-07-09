import { Input } from "@/components/input";
import { Image, Text, View } from "react-native";
import { MapPin, Calendar as IconCalendar, Settings2, UserRoundPlus, ArrowRight } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { Button } from "@/components/button";
import { useState } from "react";

enum StepForm {
  TRIP_DETAILS = 1,
  ADD_EMAIL = 2,
}

export default function Home() {
  const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAILS)

  function handleNextStepForm() {
    if (stepForm === StepForm.TRIP_DETAILS) {
      return setStepForm(StepForm.ADD_EMAIL)
    }
  }

  return (
    <View className="flex-1 items-center justify-center px-5">

      <Image
        source={require('@/assets/logo.png')}
        resizeMode="contain"
        className="h-8"
      />

      <Image source={require('@/assets/bg.png')} className="absolute"/>

      <Text className="text-zinc-400 font-regular text-center text-lg mt-3">
        Convide seus amigos e planeje sua{"\n"}
        próxima viagem
      </Text>

      <View className="w-full bg-zinc-900 p-4  rounded-lg my-8 border border-zinc-800">
        <Input >
          <MapPin size={20} color={colors.zinc[400]} />
          <Input.Field
            editable={stepForm === StepForm.TRIP_DETAILS}
            placeholder="Para onde ?"
          />
        </Input>

        <Input >
          <IconCalendar size={20} color={colors.zinc[400]} />
          <Input.Field
            editable={stepForm === StepForm.TRIP_DETAILS}
            placeholder="Quando?"
          />
        </Input>

        {stepForm === StepForm.ADD_EMAIL && (
          <>
            <View className="border-b py-3 border-zinc-800">
              <Button variant="secondary" onPress={() => setStepForm(StepForm.TRIP_DETAILS)} >
                <Button.Title>
                  Alterar local/data
                </Button.Title>
                <Settings2 className="h-5 w-5 " color={colors.zinc[200]} />
              </Button>
            </View>
            <Input >
              <UserRoundPlus size={20} color={colors.zinc[400]} />
              <Input.Field
                placeholder="Quem estará na viagem?"
              />
            </Input>

          </>
        )}



        <Button
          onPress={handleNextStepForm}
        >
          <Button.Title>
            {stepForm === StepForm.TRIP_DETAILS ? 'Continuar' : 'Confirmar Viagem'}
          </Button.Title>
          <ArrowRight className="h-5 w-5 " color={colors.lime[950]} />
        </Button>
      </View>

      <Text className="text-zinc-500 font-regular text-center text-base">
        Ao planejar sua viagem pela plann.er você automaticamente concorda com
        nossos{" "}

        <Text className="text-zinc-300 underline">
          termos de uso e política de privacidade.
        </Text>

      </Text>
    </View>
  )
}