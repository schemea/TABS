import { createContext, useContext } from "react";
import { Sheet } from "../gapi/sheet";
import { Unit } from "../resource/unit";
import { Weapon } from "../resource/weapon";
import { Effect } from "../resource/effect";
import { WeaponComponent } from "../resource/weapon-component";

export interface DataContext {
    units: Sheet<Unit>;
    weapons: Sheet<Weapon>;
    weaponComponents: Sheet<WeaponComponent>;
    effects: Sheet<Effect>;
}

const context = createContext<DataContext>({
    units: new Sheet<Unit>(),
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
