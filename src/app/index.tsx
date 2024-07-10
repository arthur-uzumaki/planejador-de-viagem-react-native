import { useEffect, useState } from "react";
import { Alert, Image, Keyboard, Text, View } from "react-native";
import {
  MapPin,
  Calendar as IconCalendar,
  Settings2,
  UserRoundPlus,
  ArrowRight,
  AtSign
} from "lucide-react-native";
import { router } from "expo-router";

import { colors } from "@/styles/colors";

import { DateData } from "react-native-calendars";
import dayjs from "dayjs";

import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import { Input } from "@/components/input";
import { Calendar } from "@/components/calendar";
import { GuestEmail } from "@/components/email";
import { Loading } from "@/components/loading";

import { DatesSelected, calendarUtils } from '@/utils/calendarUtils'
import { validateInput } from "@/utils/validateInput";

import { tripStorage } from "@/storage/trip-storage";
import { tripeServer } from "@/server/trip-server";


enum StepForm {
  TRIP_DETAILS = 1,
  ADD_EMAIL = 2,
}

enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  GUESTS = 2,
}

export default function Home() {
  const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAILS)
  const [showModal, setShowModal] = useState(MODAL.NONE)
  const [selectedDate, setSelectedDate] = useState({} as DatesSelected)
  const [destination, setDestination] = useState("" as string)
  const [emailToInvite, setEmailToInvite] = useState<string>('')
  const [emailsToInvite, setEmailsToInvite] = useState<string[]>([])
  const [isCreatingTrip, setIsCreatingTrip] = useState<boolean>(false)
  const [isGettingTrip, setIsGettingTrip] = useState<boolean>(true)

  function handleNextStepForm() {
    if (destination.trim().length === 0 || !selectedDate.startsAt ||
      !selectedDate.endsAt) {

      return Alert.alert('Detalhes da viagem',
        "Preencha todas as informações da viagem.")
    }

    if (destination.length < 4) {

      return Alert.alert('Detalhes da viagem',
        "O destino precisa te pelo menos 4 caracteres.")
    }

    if (stepForm === StepForm.TRIP_DETAILS) {
      return setStepForm(StepForm.ADD_EMAIL)
    }

    Alert.alert('Nova viagem', 'Confirmar viagem?', [
      {
        text: 'Não',
        style: 'cancel',

      },
      {
        text: 'Sim',
        onPress: createTrip
      }
    ])


  }

  function handleSelectDate(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDate.startsAt,
      endsAt: selectedDate.endsAt,
      selectedDay
    })

    setSelectedDate(dates)
  }

  function handleRemoverEmail(emailToRemover: string) {
    setEmailsToInvite((prevState) =>
      prevState.filter((email) => email !== emailToRemover)
    )
  }

  function handleAddEmail() {
    if (!validateInput.email(emailToInvite)) {
      return Alert.alert('Convidado', 'E-mail inválido!')
    }

    const emailAlreadyExists = emailsToInvite.
      find((email) => email === emailToInvite)

    if (emailAlreadyExists) {
      return Alert.alert('Convidado', 'E-mail já foi adicionado!')
    }

    setEmailsToInvite((prevState) => [...prevState, emailToInvite])
    setEmailToInvite('')
  }

  async function saveTrip(tripId: string) {
    try {
      await tripStorage.save(tripId)
      router.navigate(`/trip/${tripId}`)
    } catch (error) {
      Alert.alert('Salvar viagem',
        'Não foi possível salvar o id da viagem no dispositivo. ')

      console.error(error)

    }

  }

  async function createTrip() {
    try {
      setIsCreatingTrip(true)

      const newTrip = await tripeServer.create({
        destination,
        starts_at: dayjs(selectedDate.startsAt?.dateString).toString(),
        ends_at: dayjs(selectedDate.endsAt?.dateString).toString(),
        emails_to_invite: emailsToInvite
      })

      Alert.alert('Nova viagem', 'Viagem criado com sucesso!', [
        {
          text: 'Ok. Continuar.',
          onPress: () => saveTrip(newTrip.tripId)
        }
      ])

    } catch (error) {
      setIsCreatingTrip(false)
    }
  }

  async function getTrip() {
    try {
      const tripID = await tripStorage.get()

      if (!tripID) {
        return setIsGettingTrip(false)
      }

      const trip = await tripeServer.getById(tripID)
      
      if (trip) {
        return router.navigate(`trip/${trip.id}`)
      }
     
    } catch (error) {
      setIsGettingTrip(false)
      console.error(error);

    }
  }

  useEffect(() => {
    getTrip()
  }, [])


  if (isGettingTrip) {
    return <Loading />
  }


  return (
    <View className="flex-1 items-center justify-center px-5">

      <Image
        source={require('@/assets/logo.png')}
        resizeMode="contain"
        className="h-8"
      />

      <Image
        source={require('@/assets/bg.png')} className="absolute"
      />

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
            onChangeText={setDestination}
            value={destination}
          />
        </Input>

        <Input >
          <IconCalendar size={20} color={colors.zinc[400]} />
          <Input.Field
            editable={stepForm === StepForm.TRIP_DETAILS}
            placeholder="Quando?"
            onFocus={() => Keyboard.dismiss()}
            showSoftInputOnFocus={false}
            onPressIn={() => stepForm === StepForm.TRIP_DETAILS && setShowModal(MODAL.CALENDAR)}
            value={selectedDate.formatDatesInText}
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
                autoCorrect={false}
                value={
                  emailsToInvite.length > 0
                    ? `${emailsToInvite.length} pessoas(a) convidado(s)`
                    : ""
                }
                onPress={() => {
                  Keyboard.dismiss()
                  setShowModal(MODAL.GUESTS)
                }}
                showSoftInputOnFocus={false}
              />

            </Input>

          </>
        )}

        <Button
          onPress={handleNextStepForm}
          isLoading={isCreatingTrip}
        >
          <Button.Title>
            {stepForm === StepForm.TRIP_DETAILS ? 'Continuar' : 'Confirmar Viagem'}
          </Button.Title>
          <ArrowRight
            className="h-5 w-5 "
            color={colors.lime[950]}
          />

        </Button>
      </View>

      <Text className="text-zinc-500 font-regular text-center text-base">
        Ao planejar sua viagem pela plann.er você automaticamente concorda com
        nossos{" "}

        <Text className="text-zinc-300 underline">
          termos de uso e política de privacidade.
        </Text>

      </Text>

      <Modal
        title="Selecionar datas"
        subtitle="Selecionar a data de ida e volta da viagem"
        visible={showModal === MODAL.CALENDAR}
        onClose={() => setShowModal(MODAL.NONE)}
      >

        <View className="gap-4 mt-4">
          <Calendar
            onDayPress={handleSelectDate}
            markedDates={selectedDate.dates}
            minDate={dayjs().toISOString()}
          />

          <Button
            onPress={() => setShowModal(MODAL.NONE)}
          >
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title="Selecionar convidados"
        subtitle="Os convidados irão receber e-mails para confirmar a 
        confirmar a participação na viagem."
        visible={showModal === MODAL.GUESTS}
        onClose={() => setShowModal(MODAL.NONE)}
      >

        <View className="my-2 flex-wrap gap-2 border-b border-zinc-800 py-5 items-center">

          {emailsToInvite.length > 0 ? (
            emailsToInvite.map((email) => (
              <GuestEmail
                key={email}
                email={email}
                onRemove={() => handleRemoverEmail(email)}
              />

            ))
          ) : (
            <Text className="text-zinc-600 text-base font-regular">
              Nenhum e-mail adicionado.
            </Text>
          )}
        </View>

        <View className="gap-4 mt-4">
          <Input variant="secondary">
            <AtSign
              color={colors.zinc[400]}
              size={20}
            />
            <Input.Field
              placeholder="Digite o e-mail do convidado"
              keyboardType="email-address"
              onChangeText={(text) => setEmailToInvite(text.toLowerCase())}
              value={emailToInvite}
              returnKeyType="send"
              onSubmitEditing={handleAddEmail}
            />
          </Input>

          <Button
            onPress={handleAddEmail}
          >
            <Button.Title>
              Convidar
            </Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  )
}