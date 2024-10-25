import { configureStore } from '@reduxjs/toolkit'

import draftSlice from './draftSlice'
import pageSlice from './pageSlice'
import functionSettingSlice from './functionSettingSlice'
import printSettingSlice from './printSettingSlice'


export default configureStore({
    reducer: {
        draft: draftSlice,
        page: pageSlice,
        functionSetting: functionSettingSlice,
        printSetting: printSettingSlice,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
})