statData = {
  regions: ["africa", "americas", "asia", "europe", "oceania"],
  allData: null,
  populationOfCountries: {},
  AllApis: {
    byRegion: "https://restcountries.com/v3.1/region/",
    byCountry: "https://countriesnow.space/api/v0.1/countries/cities",
    byCity: "https://countriesnow.space/api/v0.1/countries/population/cities",
  },
};

const fetchData = async function (url, kind, countryOrCity) {
  let res;
  if (kind === "POST") {
    if (url.includes("population")) {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: countryOrCity,
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

const calcPopulationOfRegionAndCountries = function () {
  let populationCount = 0;
  for (let region of statData.regions) {
    const dataOfCountries = statData.allData[region].map((country) => {
      const name = country.name.common;
      const population = country.population;
      populationCount += country.population;
      return { name, population };
    });
    statData.populationOfCountries[region] = dataOfCountries;
    statData.populationOfCountries[region].population = populationCount;
  }
};

const getCitiesOfCountry = async function (country) {
  const citiesOfCountry = await fetchData(
    statData.AllApis.byCountry,
    "POST",
    country
  );

  return citiesOfCountry;
};

const getPopulationOfCity = async function (city) {
  const getCity = await fetchData(statData.AllApis.byCity, "POST", city);
  return getCity;
};

const startup = async function () {
  statData.allData = await promisAllData();
  calcPopulationOfRegionAndCountries();
  const getCities = await getCitiesOfCountry("jordan");
  const getCity = await getPopulationOfCity("paris");
  console.log(getCities);
  console.log(getCity);
};

startup();
