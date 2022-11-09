import { createContext, useContext } from "react";
import { Sheet } from "../gapi/sheet";
import { Unit } from "../resource/unit";
import { Weapon } from "../resource/weapon";
import { Effect } from "../resource/effect";
import { WeaponComponent } from "../resource/weapon-component";
import { Subunit } from "../resource/subunit";

export interface DataContext {
    units: Sheet<Unit>;
    subunits: Sheet<Subunit>;
    weapons: Sheet<Weapon>;
    weaponComponents: Sheet<WeaponComponent>;
    effects: Sheet<Effect>;
}

const context = createContext<DataContext>({
    units: new Sheet<Unit>(),
    subunits: new Sheet<Subunit>(),
    weapons: new Sheet<Weapon>(),
    weaponComponents: new Sheet<WeaponComponent>(),
    effects: new Sheet<Effect>(),
});

context.displayName = "DataContext";

const { Provider: DataContextProvider } = context;

export function useDataContext() {
    return useContext(context);
}

export { DataContextProvider };
