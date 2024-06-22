import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableSortLabel from "@mui/material/TableSortLabel";
import { TextField } from "@mui/material";

//ICONOS DE POSICIONES (ROL)
import topIcon from "../positions/top.png";
import jungleIcon from "../positions/jungle.png";
import midIcon from "../positions/mid.png";
import adcIcon from "../positions/adc.png";
import suppIcon from "../positions/supp.png";

// ICONOS IMPORTADOS (ELO)
import challengerIcon from "../ranks/Challenger-icon.webp";
import grandmasterIcon from "../ranks/Grandmaster-icon.webp";
import masterIcon from "../ranks/Master-icon.webp";
import diamondIcon from "../ranks/Diamond-icon.webp";
import emeraldIcon from "../ranks/Emerald-icon.webp";
import platinumdIcon from "../ranks/Platinum-icon.webp";
import goldIcon from "../ranks/Gold-icon.webp";
import silverIcon from "../ranks/Silver-icon.webp";
import bronzeIcon from "../ranks/Bronze-icon.webp";
import ironIcon from "../ranks/Iron-icon.png";
import unrankedIcon from "../ranks/Unranked-icon.webp";

interface RankedStats {
  leagueId: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

interface PlayerStats {
  streamer: string;
  summonerName: string;
  tag: string;
  encryptedSummonerId: string;
  rol: string;
  profileIconId: number; // Nuevo campo para el ID del icono de perfil
  summonerLevel: number;
  rankedStats: RankedStats | null;
  totalGames: number;
  rank?: number; // Nuevo campo para el rank
}

const ELO_ORDER = [
  "CHALLENGER",
  "GRANDMASTER",
  "MASTER",
  "DIAMOND",
  "EMERALD",
  "PLATINUM",
  "GOLD",
  "SILVER",
  "BRONZE",
  "IRON",
  "UNRANKED", // Add "UNRANKED" to the ELO_ORDER
];

const SummonerStats: React.FC = () => {
  const [playersStats, setPlayersStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("elo"); // Default to ELO
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(15);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://desirable-avrit-coderlyst-b6824b0d.koyeb.app/"
        );
        const players = response.data.map((player: any) => ({
          ...player,
          totalGames:
            (player.rankedStats?.wins || 0) + (player.rankedStats?.losses || 0),
          profileIconId: player.profileIconId, // Añadir el profileIconId
        }));
        setPlayersStats(players);
      } catch (error) {
        setError("Error al obtener datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const getEloValue = (tier: string, rank: string, lp: number) => {
    const tierIndex = ELO_ORDER.indexOf(tier);
    if (tier === "UNRANKED") {
      // Asegúrate de que "UNRANKED" tenga el valor más bajo posible
      return Number.MAX_SAFE_INTEGER; // o cualquier valor que garantice que "UNRANKED" esté al final
    } else {
      const rankValue = ["I", "II", "III", "IV"].indexOf(rank);
      return tierIndex * 10000 + rankValue * 1000 + lp; // Ajuste los multiplicadores según sea necesario
    }
  };

  // ICONOS DE (ELO)
  const getRankIcon = (tier: string) => {
    switch (tier) {
      case "CHALLENGER":
        return challengerIcon;
      case "GRANDMASTER":
        return grandmasterIcon;
      case "MASTER":
        return masterIcon;
      case "DIAMOND":
        return diamondIcon;
      case "EMERALD":
        return emeraldIcon;
      case "PLATINUM":
        return platinumdIcon;
      case "GOLD":
        return goldIcon;
      case "SILVER":
        return silverIcon;
      case "BRONZE":
        return bronzeIcon;
      case "IRON":
        return ironIcon;
      case "UNRANKED":
        return unrankedIcon;
      default:
        return null;
    }
  };

  //ICONOS DE POSICION
  const getPosicionIcon = (tier: string) => {
    switch (tier) {
      case "top":
        return topIcon;
      case "jungle":
        return jungleIcon;
      case "mid":
        return midIcon;
      case "adc":
        return adcIcon;
      case "supp":
        return suppIcon;
      default:
        return null;
    }
  };

  const filteredPlayersStats = playersStats.filter((playerStats) =>
    playerStats.streamer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortComparator = (a: PlayerStats, b: PlayerStats) => {
    // Si ambos jugadores están unranked, son iguales
    if (!a.rankedStats && !b.rankedStats) return 0;
    // Si solo uno de los jugadores está unranked, el unranked debe ir al final
    if (!a.rankedStats) return 1;
    if (!b.rankedStats) return -1;

    // Obtener valores ELO
    const aEloValue = getEloValue(a.rankedStats.tier, a.rankedStats.rank, b.rankedStats.leaguePoints);
    const bEloValue = getEloValue(b.rankedStats.tier, b.rankedStats.rank, a.rankedStats.leaguePoints);

    if (orderBy === "elo") {
      return order === "asc" ? aEloValue - bEloValue : bEloValue - aEloValue;
    }

    switch (orderBy) {
      case "streamer":
        return (a.streamer < b.streamer ? -1 : 1) * (order === "asc" ? 1 : -1);

      case "summonerName":
        return (
          (a.summonerName < b.summonerName ? -1 : 1) *
          (order === "asc" ? 1 : -1)
        );

      case "rol":
        return (a.rol < b.rol ? -1 : 1) * (order === "asc" ? 1 : -1);

      case "totalGames":
        return (a.totalGames - b.totalGames) * (order === "asc" ? 1 : -1);

      case "wins":
        return (
          ((a.rankedStats?.wins || 0) - (b.rankedStats?.wins || 0)) *
          (order === "asc" ? 1 : -1)
        );

      case "losses":
        return (
          ((a.rankedStats?.losses || 0) - (b.rankedStats?.losses || 0)) *
          (order === "asc" ? 1 : -1)
        );

      case "winRate":
        const winRateA = a.rankedStats
          ? a.rankedStats.wins / (a.rankedStats.wins + a.rankedStats.losses)
          : 0;
        const winRateB = b.rankedStats
          ? b.rankedStats.wins / (b.rankedStats.wins + b.rankedStats.losses)
          : 0;
        return (winRateA - winRateB) * (order === "asc" ? 1 : -1);

      default:
        return 0;
    }
  };

  const sortedAndRankedPlayersStats = filteredPlayersStats.sort(sortComparator).map((player, index) => ({
    ...player,
    rank: index + 1,
  }));

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <TextField
        label="Buscar invocador"
        variant="outlined"
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ marginBottom: "20px" }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>

{/*             
              <TableCell>
                <TableSortLabel
                  active={orderBy === "rank"}
                  direction={orderBy === "rank" ? order : "asc"}
                  onClick={() => handleRequestSort("rank")}
                >
                  PUESTO
                </TableSortLabel>
              </TableCell>
*/}
              <TableCell>
                <TableSortLabel
                  active={orderBy === "streamer"}
                  direction={orderBy === "streamer" ? order : "asc"}
                  onClick={() => handleRequestSort("streamer")}
                >
                  STREAMER
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={orderBy === "rol"}
                  direction={orderBy === "rol" ? order : "asc"}
                  onClick={() => handleRequestSort("rol")}
                >
                  ROL
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={orderBy === "summonerName"}
                  direction={orderBy === "summonerName" ? order : "asc"}
                  onClick={() => handleRequestSort("summonerName")}
                >
                  CUENTA
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={orderBy === "elo"}
                  direction={orderBy === "elo" ? order : "asc"}
                  onClick={() => handleRequestSort("elo")}
                >
                  ELO
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={orderBy === "totalGames"}
                  direction={orderBy === "totalGames" ? order : "asc"}
                  onClick={() => handleRequestSort("totalGames")}
                >
                  PARTIDAS
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={orderBy === "wins"}
                  direction={orderBy === "wins" ? order : "asc"}
                  onClick={() => handleRequestSort("wins")}
                >
                  GANADAS
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={orderBy === "losses"}
                  direction={orderBy === "losses" ? order : "asc"}
                  onClick={() => handleRequestSort("losses")}
                >
                  PERDIDAS
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={orderBy === "winRate"}
                  direction={orderBy === "winRate" ? order : "asc"}
                  onClick={() => handleRequestSort("winRate")}
                >
                  WINRATE
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAndRankedPlayersStats
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((playerStats) => {
                const eloText = playerStats.rankedStats
                  ? `${playerStats.rankedStats.tier} ${playerStats.rankedStats.rank} (${playerStats.rankedStats.leaguePoints} LP)`
                  : "Unranked";

                const rankIcon = playerStats.rankedStats
                  ? getRankIcon(playerStats.rankedStats.tier)
                  : getRankIcon("UNRANKED");

                const rolIcon = playerStats.rankedStats
                  ? getPosicionIcon(playerStats.rol)
                  : getPosicionIcon(playerStats.rol);

                // Calcular total de partidas jugadas (victorias + derrotas)
                const totalGames =
                  (playerStats.rankedStats?.wins || 0) +
                  (playerStats.rankedStats?.losses || 0);

                return (
                  <TableRow key={playerStats.rank}>
{/*
                    <TableCell>{playerStats.rank}</TableCell>
*/}                    
                    <TableCell>{playerStats.streamer}</TableCell>
                    <TableCell>
                      {rolIcon && (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img
                            src={rolIcon}
                            alt={playerStats.rankedStats?.tier}
                            style={{
                              width: "30px",
                              height: "30px",
                            }}
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {playerStats.profileIconId && (
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/14.12.1/img/profileicon/${playerStats.profileIconId}.png`}
                            alt={`Profile Icon ${playerStats.summonerName}`}
                            style={{
                              width: "35px",
                              height: "35px",
                              marginRight: "8px",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                        {playerStats.summonerName}#{playerStats.tag}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rankIcon && (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img
                            src={rankIcon}
                            alt={playerStats.rankedStats?.tier}
                            style={{
                              width: "35px",
                              height: "35px",
                              marginRight: "8px",
                            }}
                          />
                          <span>{eloText}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{totalGames}</TableCell>{" "}
                    {/* Nueva columna de totalGames */}
                    <TableCell>{playerStats.rankedStats?.wins || 0}</TableCell>
                    <TableCell>
                      {playerStats.rankedStats?.losses || 0}
                    </TableCell>
                    <TableCell>
                      {playerStats.rankedStats
                        ? (
                            (playerStats.rankedStats.wins /
                              (playerStats.rankedStats.wins +
                                playerStats.rankedStats.losses)) *
                            100
                          ).toFixed(2) + "%"
                        : "0%"}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default SummonerStats;
