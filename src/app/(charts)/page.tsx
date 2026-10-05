import ForecastExplorer from "../components/forecast/ForecastExplorer";
import HomeMenu from "../components/menus/HomeMenu";

export default function Home() {
  return <HomeMenu />;
  // return <ForecastExplorer coordinates={{ latitude: -3.7172, longitude: -38.5433 }} />;
}