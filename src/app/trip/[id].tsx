import { useEffect, useState } from "react";
import { Alert, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { DateData } from "react-native-calendars";
import { router, useLocalSearchParams } from 'expo-router'

import dayjs from "dayjs";
import { colors } from "@/styles/colors";

import { TripDetails, tripeServer } from "@/server/trip-server";

import { Loading } from "@/components/loading";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import { Calendar } from "@/components/calendar";

import {
  CalendarRange,
  Info,
  MapPin,
  Settings2,
  Calendar as IconCalendar
} from "lucide-react-native";

import { TripActivities } from "./activities";
import { TripDetails as Details } from "./details";

import { calendarUtils, DatesSelected } from "@/utils/calendarUtils";

export type TripData = TripDetails & { when: string }

enum MODAL {
  NONE = 0,
  UPDATE_TRIP = 1,
  CALENDAR = 2,
}

export default function Trip() {
  const tripId = useLocalSearchParams<{ id: string }>().id

  const [isLoadingTrip, setIsLoadingTrip] = useState<boolean>(true)
  const [tripDetails, setTripDetails] = useState({} as TripData)
  const [option, setOption] = useState<'activity' | 'details'>("activity")
  const [showModal, setShowModal] = useState(MODAL.NONE)
  const [destination, setDestination] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState({} as DatesSelected)
  const [isUpdating, setIsUpdating] = useState<boolean>(false)

  async function getTripDetails() {
    try {
      setIsLoadingTrip(true)

      if (!tripId) {
        return router.back()
      }

      const trip = await tripeServer.getById(tripId)

      const maxLengthDestination = 14
      const destination = trip.destination.length > maxLengthDestination
        ? trip.destination.slice(0, maxLengthDestination) + "..." : trip.destination

      const startsAt = dayjs(trip.starts_at).format('DD')
      const endsAt = dayjs(trip.ends_at).format('DD')
      const month = dayjs(trip.starts_at).format('MMM')

      setDestination(trip.destination)

      setTripDetails({
        ...trip,
        when: `${destination} de ${startsAt} a ${endsAt} de ${month}.`
      })

    } catch (error) {

      console.error(error);

    } finally {
      setIsLoadingTrip(false)
    }
  }

  function handleSelectDate(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDate.startsAt,
      endsAt: selectedDate.endsAt,
      selectedDay
    })

    setSelectedDate(dates)
  }


  async function handleUpdateTrip() {
    try {
      if (!tripId) {
        return
      }

      if (!destination || !selectedDate.startsAt || !selectedDate.endsAt) {
        return Alert.alert(
          'Atualizar viagem',
          "Lembre-se de, além de preencher o destino, selecionar data de inicio e de fim de viagem"

        )
      }

      setIsLoadingTrip(true)

      tripeServer.update({
        id: tripId,
        destination,
        starts_at: dayjs(selectedDate.startsAt.dateString).toString(),
        ends_at: dayjs(selectedDate.endsAt.dateString).toString(),

      })

      Alert.alert('Atualizar viagem', 'Viagem atualizado com sucesso!', [
        {
          text: 'Ok',
          onPress: () => {
            setShowModal(MODAL.NONE),
            getTripDetails
          }
        }
      ])
    } catch (error) {
      console.error(error);

    }
    finally{
      setIsLoadingTrip(false)
    }
  }

  useEffect(() => {
    getTripDetails()
  }, [])

  if (isLoadingTrip) {
    return <Loading />
  }

  return (
    <View className="flex-1 px-5 pt-16">
      <Input
        variant="tertiary"
      >
        <MapPin
          color={colors.zinc[400]}
          size={20}
        />

        <Input.Field
          value={tripDetails.when}
        />

        <TouchableOpacity
          activeOpacity={0.3}
          className="w-9 h-9 bg-zinc-800 items-center justify-center rounded "
          onPress={() => setShowModal(MODAL.UPDATE_TRIP)}
        >
          <Settings2
            color={colors.zinc[400]}
            size={20}
          />
        </TouchableOpacity>
      </Input>

      {option === 'activity' ?
        (
          <TripActivities
            tripDetails={tripDetails}
          />
        )
        : (

          <Details tripId={tripDetails.id}
          />
        )}

      <View className="w-full absolute -bottom-1 self-center justify-end pb-5 z-10 bg-zinc-950">
        <View className="w-full flex-row bg-zinc-900 p-4 rounded-lg border border-l-zinc-800 gap-2">
          <Button
            className="flex-1"
            onPress={() => setOption('activity')}
            variant={option === 'activity' ? 'primary' : 'secondary'}
          >

            <CalendarRange
              color={option === 'activity' ? colors.lime[950] : colors.zinc[200]}
              size={20}
            />

            <Button.Title>
              Atividades
            </Button.Title>
          </Button>

          <Button
            className="flex-1"
            onPress={() => setOption('details')}
            variant={option === 'details' ? 'primary' : 'secondary'}
          >
            <Info
              color={option === 'details' ? colors.lime[950] : colors.zinc[200]}
              size={20}
            />

            <Button.Title>
              Detalhes
            </Button.Title>
          </Button>
        </View>
      </View>


      <Modal
        title="Atualizar viagem"
        subtitle="Somente quem criou a viagem pode editar."
        visible={showModal === MODAL.UPDATE_TRIP}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="gap-2 my-4">
          <Input variant="secondary">
            <MapPin
              color={colors.zinc[400]}
              size={20}
            />

            <Input.Field
              placeholder="Para onde?"
              onChangeText={setDestination}
              value={destination}
            />
          </Input>

          <Input variant="secondary">
            <IconCalendar
              color={colors.zinc[400]}
              size={20}
            />

            <Input.Field
              placeholder="Quando?"
              value={selectedDate.formatDatesInText}
              onPressIn={() => setShowModal(MODAL.CALENDAR)}
              onFocus={() => Keyboard.dismiss()}
            />
          </Input>

          <Button
            onPress={handleUpdateTrip}
            isLoading={isUpdating}
          >
            <Button.Title>Atualizar</Button.Title>
          </Button>
        </View>
      </Modal>

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
            onPress={() => setShowModal(MODAL.UPDATE_TRIP)}
          >
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  )
}