
const useQuery = () => {
    const getKeyValue=(arr:any,key:any)=>{
        let val=''
        arr&&arr.forEach((item:any, i:number) => {
                if ( item.name === key) {
                  val= item.value
                }
              });
            return parseFloat(val)
    }
  return getKeyValue
}
export default useQuery