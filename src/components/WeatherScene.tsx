"use client";

interface WeatherSceneProps {
  condition: string;
  isNight: boolean;
}

export default function WeatherScene({
  condition,
  isNight,
}: WeatherSceneProps) {
  const normalizedCondition = condition.toLowerCase().trim();
  console.log("Current weather condition:", normalizedCondition); // Debug log

  const getSceneElements = () => {
    switch (normalizedCondition) {
      case "clear":
      case "clear sky":
      case "sunny":
        return (
          <>
            {!isNight && <div className="scene-element sun"></div>}
            {isNight && <div className="scene-element moon"></div>}
            {isNight && <div className="scene-element stars"></div>}
            <div className="scene-element clouds light"></div>
            {!isNight && <div className="scene-element birds"></div>}
          </>
        );
      case "rain":
      case "light rain":
      case "moderate rain":
      case "heavy rain":
      case "drizzle":
        return (
          <>
            <div className="scene-element rain-drops"></div>
            <div className="scene-element dark-clouds"></div>
            <div className="scene-element puddles"></div>
            {isNight && <div className="scene-element stars faded"></div>}
          </>
        );
      case "thunderstorm":
      case "thunder":
      case "storm":
        return (
          <>
            <div className="scene-element lightning"></div>
            <div className="scene-element dark-clouds"></div>
            <div className="scene-element heavy-rain"></div>
            {isNight && <div className="scene-element stars faded"></div>}
          </>
        );
      case "snow":
      case "light snow":
      case "heavy snow":
        return (
          <>
            <div className="scene-element snowflakes"></div>
            <div className="scene-element light-clouds"></div>
            {isNight && <div className="scene-element stars faded"></div>}
          </>
        );
      case "clouds":
      case "cloudy":
      case "few clouds":
      case "scattered clouds":
      case "broken clouds":
      case "overcast clouds":
      case "partly cloudy":
      case "mist":
      case "fog":
      case "haze":
        return (
          <>
            {!isNight && <div className="scene-element sun partial"></div>}
            {isNight && <div className="scene-element moon partial"></div>}
            <div className="scene-element clouds"></div>
            {isNight && <div className="scene-element stars faded"></div>}
          </>
        );
      default:
        console.log("Unhandled weather condition:", normalizedCondition); // Debug log
        return (
          <>
            <div className="scene-element clouds light"></div>
            {isNight && <div className="scene-element stars"></div>}
          </>
        );
    }
  };

  const getSceneClass = () => {
    let baseClass = normalizedCondition.replace(/\s+/g, "-");

    if (
      normalizedCondition.includes("cloud") ||
      normalizedCondition === "mist" ||
      normalizedCondition === "fog" ||
      normalizedCondition === "haze"
    ) {
      baseClass = "cloudy";
    }

    return `weather-scene ${baseClass} ${isNight ? "night" : "day"}`;
  };

  return (
    <div className={getSceneClass()} style={{ zIndex: 0 }}>
      <div className="scene-background"></div>
      {getSceneElements()}
      <div className="scene-element house"></div>
      <div className="scene-element dog"></div>
      <div className="scene-element cat"></div>
      <div className="scene-element ball"></div>
      <div className="scene-element ground"></div>
    </div>
  );
}
