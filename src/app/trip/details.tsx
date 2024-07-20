import { useEffect, useState } from "react";
import { Alert, Text, View, FlatList } from "react-native";

import { Plus } from "lucide-react-native";


import { Button } from "@/components/button";
import { colors } from "@/styles/colors";
import { Modal } from "@/components/modal";
import { Input } from "@/components/input";
import { TripLink, TripLinkProps } from "@/components/trip-link";
import { ParticipantProps, Participant } from "@/components/participant";

import { validateInput } from "@/utils/validateInput";

import { linksServer } from "@/server/links-server";
import { participantsServer } from "@/server/participants-server";

export function TripDetails({ tripId }: { tripId: string }) {
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false)
  const [linkTitle, setLinkTitle] = useState<string>('')
  const [linkURL, setLinkURL] = useState<string>('')
  const [isCreatingLinkTrip, setISCreatingLinkTrip] = useState<boolean>(false)
  const [links, setLinks] = useState<TripLinkProps[]>([])
  const [participants, setParticipants] = useState<ParticipantProps[]>([])


  function resetNewLinkFields() {
    setLinkTitle('')
    setLinkURL('')
    setShowLinkModal(false)
  }

  async function handleCreateTripLink() {
    try {
      if (!linkTitle.trim()) {
        return Alert.alert('Link', 'Informe o título do link.')
      }

      if (!validateInput.url(linkURL.trim())) {
        return Alert.alert('Link', 'Link inválido!')
      }

      setISCreatingLinkTrip(true)

      await linksServer.create({
        tripId,
        title: linkTitle,
        url: linkURL
      })

      Alert.alert('Link', 'Link criado com sucesso!')

      resetNewLinkFields()
     
      await getTripLinks()

    } catch (error) {
      console.error(error);

    } finally {
      setISCreatingLinkTrip(false)
    }
  }

  async function getTripLinks() {
    try {
      const links = await linksServer.getLinksByTripId(tripId)
      setLinks(links)

    } catch (error) {
      console.error(error);

    }
  }

  async function getTripParticipants() {
    try {
      const participants = await participantsServer.getByTripId(tripId)
      setParticipants(participants)

    } catch (error) {
      console.error(error)
      
    }
  }

  useEffect(() => {
    getTripLinks()
    getTripParticipants()
  }, [])

  return (
    <View className="flex-1 mt-10">

      <Text className="text-zinc-50 text-2xl font-semibold mb-2">
        Links importantes
      </Text>

      <View className="flex-1">
        {links.length > 0 ?

          <FlatList
            data={links}
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-4"
            showsVerticalScrollIndicator={false}
            renderItem={(({ item }) => <TripLink data={item} />)}
          />
          : (
            <Text className="text-zinc-400 font-regular text-base mt-2 mb-6">
              Nenhum link adicionado.
            </Text>
          )
        }

        <Button
          variant="secondary"
          onPress={() => setShowLinkModal(true)}
        >
          <Plus
            color={colors.zinc[200]}
            size={20}
          />

          <Button.Title>
            Cadastrar novo link
          </Button.Title>
        </Button>

      </View>

      <View className="flex-1 border-t border-zinc-800 mt-6">

        <Text className="text-zinc-50 text-2xl font-semibold my-6">
          Convidados
        </Text>

        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-4 pb-44"
          showsVerticalScrollIndicator={false}
          renderItem={(({item})=> <Participant data={item}/>)}
        />
      </View>

      <Modal
        title="Cadastrar link"
        subtitle="Todos os convidados podem visualizar os links importantes."
        visible={showLinkModal}
        onClose={() => setShowLinkModal(false)}
      >
        <View className="gap-2 mb-3">

          <Input variant="secondary">
            <Input.Field
              placeholder="Título do link"
              onChangeText={setLinkTitle}
            />
          </Input>

          <Input variant="secondary">
            <Input.Field
              placeholder="URL"
              onChangeText={setLinkURL}
            />
          </Input>
        </View>

        <Button
          isLoading={isCreatingLinkTrip}
          onPress={handleCreateTripLink}
        >
          <Button.Title>
            Salvar link
          </Button.Title>
        </Button>
      </Modal>
    </View>
  )
}