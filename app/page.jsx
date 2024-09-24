"use client";
import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import packs from './assets/charts.json';

export default function ArcaeaPlayRatingCalculator() {
  const [x, setX] = useState('0');
  const [y, setY] = useState('0');
  const [selectedSong, setSelectedSong] = useState(
  '["Arcaea","Sayonara Hatsukoi"]');
  const [selectedPack, setSelectedPack] = useState('Arcaea');
  const [songTitle, setSongTitle] = useState("if you're seeing this, something probably went wrong");
  const [song, setSong] = useState({
    "artist": "REDSHiFT",
    "pack": "Arcaea",
    "side": "Light",
    "difficulties": {
        "past": {
            "level": "1",
            "notes": 205,
            "constant": 1.5,
            "charter": "Nitro"
        },
        "present": {
            "level": "4",
            "notes": 305,
            "constant": 4.5,
            "charter": "Nitro"
        },
        "future": {
            "level": "7",
            "notes": 666,
            "constant": 7,
            "charter": "Toaster"
        },
        "eternal": {
            "level": "8",
            "notes": 728,
            "constant": 8.5,
            "charter": "Luxance + Exschwasion"
        }
    }
  });

  const [difficulty, setDifficulty] = useState({
    level: 'no',
    notes: 1,
    constant: 0,
    charter: 'no',
  });

  const [pure, setPure] = useState(0);
  const [lost, setLost] = useState(0);
  const [score, setScore] = useState(0);
  const [grade, setGrade] = useState('D');
  const [scoreModifier, setScoreModifier] = useState(0);
  const [potentialValue, setPotentialValue] = useState(0);
  const [potentialTier, setPotentialTier] = useState('blue');
  const [selectedDifficulty, setSelectedDifficulty] = useState('past');

  // Store data for the chart
  const [chartData, setChartData] = useState([]);

  // Effect to calculate lost notes, score, and update chart data
  useEffect(() => {
    const newLost = difficulty.notes - pure;
    const newScore = Math.ceil((pure / difficulty.notes) * 1e7);
    const newScoreModifier = calculateScoreModifier(newScore);
    const newPotentialValue = calculatePotential(newScore, newScoreModifier);

    setLost(newLost);
    setScore(newScore);
    setScoreModifier(newScoreModifier);
    setPotentialValue(newPotentialValue);
  const  scoreToGraphX =(score) => {
      return score > 10e6 ? 150 : Math.min((score - 8.6e6) / 1e4, 150);
    }
    setX(scoreToGraphX(score));
    const numberX = Number(x);
    if (score <= 9.8e6) {
      // EX or above
      setY(70 - (numberX / 120) * 50)
    } else {
      // Below EX
      setY(20 - ((numberX - 120) / 20) * 10)
    }
    console.log("posx:", x, "posy:", y);

    // Update chart data
    setChartData(prevData => [
      ...prevData,
      { name: `Difficulty ${difficulty.level}`, score: newScore }
    ]);

  }, [pure, difficulty]);

  // Effect to handle grade changes based on score
  useEffect(() => {
    if (score >= 9.9e6) {
      setGrade('EX+');
    } else if (score >= 9.8e6) {
      setGrade('EX');
    } else if (score >= 9.5e6) {
      setGrade('AA');
    } else if (score >= 9.2e6) {
      setGrade('A');
    } else if (score >= 8.9e6) {
      setGrade('B');
    } else if (score >= 8.6e6) {
      setGrade('C');
    } else {
      setGrade('D');
    }
  }, [score]);

  // Calculate potential value and tier based on new score
  const calculatePotential = (newScore, newScoreModifier) => {
    const potentialValue = Math.max(Math.round((difficulty.constant + newScoreModifier) * 100) / 100, 0.0);
    setPotentialTier(determinePotentialTier(potentialValue));
    return potentialValue;
  }
	// Position of point on graph.
  

  // Calculate score modifier based on new score
  const calculateScoreModifier = (newScore) => {
    if (newScore >= 10e6) return 2;
    if (newScore > 9.8e6) return 1 + (newScore - 9.8e6) / 0.2e6;
    return (newScore - 9.5e6) / 0.3e6;
  }

  // Determine potential tier based on potential value
  const determinePotentialTier = (newPotentialValue) => {
    if (newPotentialValue >= 13.0) return 'star3';
    if (newPotentialValue >= 12.5) return 'star2';
    if (newPotentialValue >= 12.0) return 'star1';
    if (newPotentialValue >= 11.0) return 'tomato-deco';
    if (newPotentialValue >= 10.0) return 'purple-deco';
    if (newPotentialValue >= 7.0) return 'purple';
    if (newPotentialValue >= 3.5) return 'green';
    return 'blue';
  }
  const scoreThresholds = {
    exRank: 9.8,
    maxScore: 10.0,
    dottedLineStart: 140,
    dottedLineEnd: 150,
  };
  // Handle song change
  useEffect(() => {
    if (selectedSong) {
      const data = JSON.parse(selectedSong);
      const pack = packs[data[0]];
      const selectedSongData = pack[data[1]];
      setSongTitle(data[1]);
      setSong(selectedSongData);
      setDifficulty(selectedSongData.difficulties[selectedDifficulty]);

      // Set pure notes based on selected difficulty
      const calculatedPure = Math.floor(0.83 * selectedSongData.difficulties[selectedDifficulty].notes);
      setPure(calculatedPure);
    }
  }, [selectedSong, selectedDifficulty]);

  console.log("song", song);
  console.log("selected song", selectedSong);
  // Song select JSX
  return (
    <div>
      <h1>Arcaea Play Rating Calculator</h1>
      <a href="https://github.com/12beesinatrenchcoat/arcaea-potential-calculator">Source Code</a>
      <a href="https://arcaea.fandom.com/">Arcaea Community Wiki</a>
      <p>This is a fanmade project. It is unaffiliated with Arcaea and lowiro. Arcaea belongs to lowiro. Check it out <a href="https://arcaea.lowiro.com">here!</a></p>

      <div className="two-column">
        <div id="select-menu" className="flow">
          <label>
            Pack
            <select value={selectedPack} onChange={(e) => setSelectedPack(e.target.value)}>
              {Object.keys(packs).map((pack) => (
                <option key={pack}  sevalue={pack}>{pack}</option>
              ))}
            </select>
          </label>
          <label>
            Song
            <select value={selectedSong} onChange={(e) => setSelectedSong(e.target.value)}>
              {Object.keys(packs[selectedPack]).map((song) => (
                <option key={song} selected value={`["${selectedPack}","${song}"]`}>{song}</option>
              ))}
            </select>
          </label>
          <div id="difficulty-select" >

			<label>
				<input
					type="radio"
          onChange={(e) => setSelectedDifficulty(e.target.value)}
					name="difficulty"
					value="past"
					disabled={!song.difficulties.past}
				/>
				PAST
			</label>
			<label>
				<input
					type="radio"
          onChange={(e) => setSelectedDifficulty(e.target.value)}
					name="difficulty"
					value="present"
					disabled={!song.difficulties.present}
				/>
				PRESENT
			</label>
			<label>
				<input
					type="radio"
          onChange={(e) => setSelectedDifficulty(e.target.value)}
					name="difficulty"
					value="future"
					disabled={!song.difficulties.future}
				/>
				FUTURE
			</label>
			<label>
				<input
					type="radio"
          onChange={(e) => setSelectedDifficulty(e.target.value)}
					name="difficulty"
					value="beyond"
					disabled={!song.difficulties.beyond}
				/>
				BEYOND
			</label>
		</div>
        </div>
        <div class="flow">
		<div id="song-info">
			<p>{song.pack}</p>
			<h2 id="song-title">{songTitle}</h2>
			<p>{song.artist}</p>
		</div>
		<div id="diff-info">
			<p id="difficulty" class={selectedDifficulty}>
				{(selectedDifficulty || '').toUpperCase()}
			</p>
			<p>
				Level: {difficulty.level} (constant {difficulty.constant.toFixed(1)})
			</p>
			<p>Note count: {difficulty.notes}</p>
			<p>Note design: {difficulty.charter}</p>
		</div>
	      </div>
      </div>



      {/* Slider for Pure Input */}
      <div id="stats">
        <p id="result">
          <span id="score">{score}</span>
          <span id="grade" data-grade={grade}>{grade}</span>
        </p>
        <div id="potential">
		<div
			id="potential-diamond"
			data-ptt={potentialValue.toFixed(2)}
			data-tier={potentialTier}
		/>
	</div>
        <div id="judge">
          <span>PURE: {pure}</span>
          <span>LOST: {lost}</span>
        </div>
        

      </div>
      <input
          type="range"
          id="pure-slider"
          name="pure"
          value={pure}
          onChange={(e) => setPure(Number(e.target.value))}
          step="1"
          min={Math.max(Math.floor(difficulty.notes * 0.83), 0)}
          max={difficulty.notes}
        />
      <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
            allowDecimals={false}
            allowDuplicatedCategory={false}
            axisLine
            dataKey="name"
            tickLine
        />
        <YAxis 
            axisLine
            tick
            tickLine
        />
        <Tooltip />
        <Legend />
        <Line
          type="linear"
          dot={false}
          dataKey="score"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        
        {/* Custom Line for Score before 9.8m */}
        <line
          x1={120}
          y1={20}
          x2={140}
          y2={10}
          stroke="currentColor"
          strokeWidth={2}
          style={{ vectorEffect: 'non-scaling-stroke' }}
        />
        {/* Dotted Line for Score 9.8m - 10.0m */}
        <line
          x1={140}
          y1={10}
          x2={150}
          y2={10}
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray="4"
        />
        {/* Dotted Line for Score after 10.0m */}
        <line
          x1={120}
          y1={0}
          x2={120}
          y2={70}
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray="4"
        />

        {/* EX Rank Text */}
        <text
          x={121}
          y={69}
          fill="white"
          fontSize="1.5em"
          textAnchor="middle"
          dominantBaseline="middle"
          opacity={0.2}
        >
          EX
        </text>

        {/* Score Markers */}
        {chartData.map((entry, index) => (
          <circle key={index} cx={entry.x} cy={entry.y} r={1.5} fill="currentColor" />
        ))}
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
}
