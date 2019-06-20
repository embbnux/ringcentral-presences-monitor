import useGlobalStorage from 'use-global-storage';

const useStorage = useGlobalStorage({
  storageOptions: { name: 'call-supervise-data' }
});

export default useStorage;
