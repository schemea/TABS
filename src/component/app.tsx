import React from "react";
import { SheetClient } from "../gapi/sheet";
import { usePromise } from "../hook/promise";
import { Unit } from "../resource/unit";
import { Weapon } from "../resource/weapon";
import { GOOGLE_API_KEY } from "../gapi/config";
import { Effect } from "../resource/effect";
import { DataContextProvider } from "../context/data";
import { UnitList } from "./unit";
import { Backdrop, CircularProgress, createTheme, ThemeProvider } from "@material-ui/core";
import { blue, cyan } from "@material-ui/core/colors";
import { WeaponComponent } from "../resource/weapon-component";

const spreadsheet = SheetClient.create(GOOGLE_API_KEY, "v4")
    .then(client => client.spreadsheet("1wa0nWiy-uXbePbXfQKQDbQie4fm8MRCdYizp0vX1ZRU"));

const theme = createTheme({
    palette: {
        primary: blue,
        secondary: cyan,
        type: "dark",
    },
});

export function Application() {

    const data = usePromise(
        Promise.all([
            spreadsheet.then(spreadsheet => spreadsheet.sheet("units", Unit)),
            spreadsheet.then(spreadsheet => spreadsheet.sheet("weapons", Weapon)),
            spreadsheet.then(spreadsheet => spreadsheet.sheet("weapon components", WeaponComponent)),
            spreadsheet.then(spreadsheet => spreadsheet.sheet("effects", Effect)),
        ]),
        ([ units, weapons, weaponComponents, effects ]) => ({ units, weapons, weaponComponents, effects }),
    );

    return (
        <ThemeProvider theme={ theme }>
            <Backdrop open={ !data }>
                <CircularProgress size={ 100 }/>
            </Backdrop>
            <h1>Totally Accurate Battle Simulator</h1>
            { data && (
                <DataContextProvider value={ data }>
                    <UnitList/>
                </DataContextProvider>
            ) }
        </ThemeProvider>
    );
}
