import { create } from 'zustand'

export const useStore = create((set) => ({
  editorState: [],
  tableOfContents: [],
  reportUid: null,
  bulletinName: '',
  isPublished: false,
  publishedCache:{},
  updatePublishedCache: (update) => set((state)=>({ 
    publishedCache: {
      ...state?.publishedCache,
      ...update 
    }}
  )),
  setPublished: (status) => set({ isPublished: status }),
  getEditorState: (newEditorState) => set({ editorState: newEditorState }),
  setReportUid: (uid) => set({ reportUid: uid }),
  setBulletinName: (name) => set({ bulletinName: name }),
  setTableOfContents: (entry) => {
    set((prevState) => {
      const entryExists = prevState?.tableOfContents?.some(
        ({ title, pageNumber, level }) =>
          title === entry?.title && pageNumber === entry?.pageNumber && level === entry?.level,
      );
      return ({
        tableOfContents: entryExists ? prevState?.tableOfContents : [...prevState?.tableOfContents, entry]
      });
    })
  }
}))