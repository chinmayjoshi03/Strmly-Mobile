import { StyleSheet } from 'react-native';
import ThemedView from "../components/ThemedView";
import Signin from './(auth)/signin';

const Home = () => {
  return (
    <ThemedView style={styles.container}>

      {/* <ThemedText className="text-xl">The Number 1</ThemedText>

      <ThemedText style={{ marginTop: 10, marginBottom: 30 }}>
        Signin
      </ThemedText> */}

      {/* <Link href="/(auth)/signin" style={styles.link}>
        <Signin/>
      </Link> */}

      <Signin/>

    </ThemedView>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    marginVertical: 20
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  link: {
    marginVertical: 10,
    borderBottomWidth: 1
  },
})