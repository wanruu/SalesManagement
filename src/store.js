import { configureStore } from '@reduxjs/toolkit'

import draftSlice from './slices/draftSlice'
import pageSlice from './slices/pageSlice'
import functionSettingSlice from './slices/functionSettingSlice'
import printSettingSlice from './slices/printSettingSlice'


export default configureStore({
    reducer: {
        draft: draftSlice,
        page: pageSlice,
        functionSetting: functionSettingSlice,
        printSetting: printSettingSlice,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
})