import { configureStore } from '@reduxjs/toolkit'

import draftSlice from './draftSlice'
import pageSlice from './pageSlice'
import functionSettingSlice from './functionSettingSlice'
import printSettingSlice from './printSettingSlice'
import globalInfoSlice from './globalInfoSlice'


export default configureStore({
    reducer: {
        draft: draftSlice,
        page: pageSlice,
        functionSetting: functionSettingSlice,
        printSetting: printSettingSlice,
        globalInfo: globalInfoSlice,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
})