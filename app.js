const countries = document.querySelector(".countries");
const titles = document.querySelector(".titles");
const countriesSelect = document.querySelector(".countriesSelect");
const regionName = document.querySelector(".regionName");
const countryDetails = document.querySelector(".countryDetails");
const detailsFlag = document.querySelector(".details-flag");
const detailsName = document.querySelector(".details-name");
const detailsCapital = document.querySelector(".details-capital");
const detailsArea = document.querySelector(".details-area");
const detailsPopulation = document.querySelector(".details-population");
const detailsBorders = document.querySelector(".details-borders");
const spinner = document.querySelector(".loader");
const refresh = document.querySelector(".refresh");
const ctx = document.getElementById("myChart").getContext("2d");

statData = {
  regions: ["africa", "americas", "asia", "europe", "oceania"],
  isLoading: false,
  allData: null,
  dataOfCountries: [],
  populationOfCountries: {},
  commonAndOfficialNames: {},
  AllApis: {
    byRegion: "https://restcountries.com/v3.1/region/",
    getCitiesByCountry:
      "https://countriesnow.space/api/v0.1/countries/population/cities/filter",
  },
};

const setSpinner = function () {
  if (statData.isLoading) {
    countryDetails.style.display = "none";
    spinner.style.display = "block";
  } else {
    countryDetails.style.display = "flex";
    spinner.style.display = "none";
  }
};
const fetchData = async function (url, kind, countryOrCity) {
  try {
    statData.isLoading = true;
    setSpinner();
    let res;
    if (kind === "POST") {
      if (url.includes("population")) {
        res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            limit: 20,
            order: "asc",
            orderBy: "name",
            country: countryOrCity,
          }),
        });
      } else {
        res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            country: countryOrCity,
          }),
        });
      }
    } else {
      res = await fetch(url);
    }

    const data = await res.json();
    return data;
  } catch {
    console.log("data not found");
  }
};

const promisAllData = async function () {
  const regionsData = statData.regions.map((region) => {
    return fetchData(statData.AllApis.byRegion + region);
  });
  const [africa, americas, asia, europe, oceania] = await Promise.all(
    regionsData
  );
  return { africa, americas, asia, europe, oceania };
};

const detailsOfRegionAndCountries = function () {
  populationRegionObj = {};
  populationCountriesObj = {};
  for (let region of statData.regions) {
    let populationCount = 0;
    for (let country of statData.allData[region]) {
      const name = country.name.common.toLowerCase();
      const officalName = country.name.official;
      const capital = country.capital;
      const population = country.population;
      const flag = country.flags;
      const area = country.area;
      const borders = country.borders;
      populationCount += country.population;
      statData.commonAndOfficialNames[name] = officalName;
      statData.dataOfCountries.push({
        name,
        capital,
        population,
        flag,
        area,
        borders,
      });
      populationCountriesObj[name] = population;
      populationRegionObj[region] = populationCount;
    }
    statData.populationOfCountries[region] = populationCountriesObj;
    populationCountriesObj = {};
  }
  sendDataToChart(populationRegionObj);
};
const checkOfficialName = function (country) {
  for (let commonName in statData.commonAndOfficialNames) {
    if (commonName === country)
      return statData.commonAndOfficialNames[commonName];
  }
};
const getPopulationOfCitiesInSpisificCountry = async function (country) {
  let getCities = await fetchData(
    statData.AllApis.getCitiesByCountry,
    "POST",
    country
  );
  if (!getCities.data) {
    const officialName = checkOfficialName(country);
    getCities = await fetchData(
      statData.AllApis.getCitiesByCountry,
      "POST",
      officialName
    );
  }
  const cities = {};
  if (getCities.data) {
    for (let city of getCities.data) {
      const myCity = city.city;
      const population = city.populationCounts[0].value;
      cities[myCity] = population;
    }
  }
  return cities;
};

const startup = async function () {
  statData.allData = await promisAllData();
  detailsOfRegionAndCountries();
};

const fillCountriesIntoSelectBox = function (region) {
  countriesSelect.replaceChildren();
  const headOfSelectList = document.createElement("option");
  headOfSelectList.classList.add("optionDiv");
  headOfSelectList.setAttribute("disabled", true);
  headOfSelectList.setAttribute("selected", true);
  headOfSelectList.textContent = "Select Country";
  countriesSelect.appendChild(headOfSelectList);
  for (let country in statData.populationOfCountries[region]) {
    const optionDiv = document.createElement("option");
    optionDiv.classList.add("optionDiv");
    optionDiv.setAttribute("id", country);
    optionDiv.setAttribute("value", country);
    optionDiv.textContent = country;
    countriesSelect.appendChild(optionDiv);
  }

  regionName.textContent = region;
};
const getDetailsOfCountry = function (countryName) {
  const details = statData.dataOfCountries.find((country) => {
    return country.name === countryName;
  });
  detailsFlag.src = details.flag["png"];
  detailsName.textContent = "Name:" + " " + details["name"];
  detailsCapital.textContent = "Capital:" + " " + details["capital"];
  detailsArea.textContent = "Area:" + " " + details["area"] / 1000 + " Km2";
  detailsPopulation.textContent =
    "Population:" + " " + details["population"] / 1000000 + "million";
  detailsBorders.textContent = "Borders :";
  if (details.borders !== undefined) {
    details.borders.forEach((country) => {
      const borderDiv = document.createElement("div");
      borderDiv.textContent = country;
      detailsBorders.appendChild(borderDiv);
    });
  }
};
const showCities = async function (e) {
  detailsFlag.style.display = "block";
  countryDetails.style.display = "flex";
  countries.style.justifyContent = "flex-start";
  const countryName = e.target.selectedOptions[0].value;
  const cities = await getPopulationOfCitiesInSpisificCountry(countryName);
  sendDataToChart(cities);
  getDetailsOfCountry(countryName);
};
const showCountries = function (e) {
  detailsFlag.style.display = "none";
  detailsName.textContent = "";
  detailsCapital.textContent = "";
  detailsArea.textContent = "";
  detailsPopulation.textContent = "";
  detailsBorders.textContent = "";
  countries.style.display = "flex";
  const nameOfRegion = e.target.id;
  sendDataToChart(statData.populationOfCountries[nameOfRegion]);
  fillCountriesIntoSelectBox(nameOfRegion);
};
const backToFirstFunc = function () {
  countries.style.display = "none";
  detailsOfRegionAndCountries();
};
const events = function () {
  titles.addEventListener("click", showCountries);
  countriesSelect.addEventListener("change", showCities);
  refresh.addEventListener("click", backToFirstFunc);
};
const sendDataToChart = function (recievedData) {
  statData.isLoading = false;
  setSpinner();
  data.datasets[0].data = recievedData;
  myChart.update();
};
startup();
events();

const data = {
  datasets: [
    {
      label: "",
      data: "",
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

const config = {
  type: "bar",
  data,
  options: {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "white",
        },
      },
    },
  },
};
let myChart = new Chart(document.getElementById("myChart"), config);
