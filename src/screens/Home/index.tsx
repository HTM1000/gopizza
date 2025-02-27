import React, { useState, useCallback } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, Alert, FlatList } from 'react-native';
import { useTheme } from 'styled-components/native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import firestore from '@react-native-firebase/firestore';

import HappyEmoji from '@assets/happy.png';
import { useAuth } from '@hooks/auth';
import { Search } from '@components/Search';
import { ProductCard, ProductProps } from '@components/ProductCard';

import { 
  Container, 
  Header, 
  Greeting, 
  GreetingEmoji, 
  GreetingText,
  MenuHeader,
  MenuItemsNumber,
  Title,
  NewProductButton
} from './styles';


export function Home() {
  const [pizzas, setPizzas] = useState<ProductProps[]>([]);
  const [search, setSearch] = useState('');

  const { COLORS } = useTheme();

  const navigation = useNavigation();
  
  const { user, signOut } = useAuth();

  function fetchPizza(value: string){
    const formattedValue = value.toLocaleLowerCase().trim();

    firestore()
    .collection('pizzas')
    .orderBy('name_insensitive')
    .startAt(formattedValue)
    .endAt(`${formattedValue}\uf8ff`)
    .get()
    .then(response => {
      const data = response.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data(),
        }
      }) as ProductProps[];
      setPizzas(data);
    })
    .catch(() => Alert.alert('Consulta', 'Nao foi possivel realizar a consulta'));
  }

  function handleSearch(){
    fetchPizza(search);
  }

  function handleSearchClear(){
    setSearch('');
    fetchPizza('');
  }

  function handleOpen(id: string){
    const route = user?.isAdmin ? 'products' : 'order';
    navigation.navigate(route, { id })
  }

  function handleAdd(){
    navigation.navigate('products', {})
  }

  useFocusEffect(useCallback(() => {
    fetchPizza('');
    }, [])
  );

  return (
    <Container>
      <Header>
        <Greeting>
          <GreetingEmoji source={HappyEmoji} />
          <GreetingText>Olá, Admin</GreetingText>
        </Greeting>

        <TouchableOpacity onPress={signOut}>
          <MaterialIcons name="logout" color={COLORS.TITLE} size={24} />
        </TouchableOpacity>

      </Header>

      <Search 
      onChangeText={setSearch}
      value={search}
      onSearch={handleSearch} 
      onClear={handleSearchClear}/>

      <MenuHeader>
        <Title>Cardápio</Title>
        <MenuItemsNumber>{pizzas.length} pizzas</MenuItemsNumber>
      </MenuHeader>

      <FlatList 
        data={pizzas}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
        <ProductCard data={item} onPress={() => handleOpen(item.id)} />
        )} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 125,
          marginHorizontal: 24,
        }}
      />

      {
        user?.isAdmin &&
        <NewProductButton 
        title="Cadastrar Pizza"
        type="secondary"
        onPress={handleAdd}
        />
      }
    </Container>
  );
}