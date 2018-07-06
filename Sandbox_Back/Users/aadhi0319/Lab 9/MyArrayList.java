import java.util.Arrays;

public class MyArrayList implements MyList{
    private Object[] list = new Object[0];
    
    public boolean add(Object obj){
        Object[] temp = new Object[list.length+1];
        for(int i = 0; i < list.length; i++){
            temp[i] = list[i];
        }
        temp[list.length] = obj;
        list = temp;
        return true;
    }
    
    /**
	 *	Add obj to the specified index of the list.
	 *	If index is too big, then add obj to the end of the list
	 *	If index is too small, then add obj to the start of the list
	 */
	public void add(int index, Object obj){
	    Object[] temp = new Object[list.length+1];
	    int inc = 0;
	    for(int i = 0; i < list.length+1; i++){
	        if(i == index){
	            temp[i] = obj;
	        }else{
	            temp[i] = list[inc];
	            inc++;
	        }
	    }
	    list = temp;
	}
	
	/**
	 *	Return true is this list contains something that is .equals() to obj
	 */
	public boolean contains(Object obj){
	    for(Object i : list){
	        if(i.equals(obj))
	            return true;
	    }
	    return false;
	}
	
	/**
	 *	Return the Object located at the specified index
	 *	If index is too big or too small, return null
	 */
	public Object get(int index){
	    if(index >= list.length || index < 0){
	        return null;
	    }
	    return list[index];
	}
	
	/**
	 *	Return true if there are no elements in the list
	 */
	public boolean isEmpty(){
	    return (list.length == 0);
	}
	
	/**
	 *	Remove the Object at the specified index from the list
	 *	Return the Object that was removed
	 *	If index is too big or to small, do not remove anything from the list and return null
	 *  If the list is empty, return null
	 */
	public Object remove(int index){
	    Object[] temp = new Object[list.length-1];
	    int inc = 0;
	    if(index >= list.length || index < 0 || isEmpty()){
	        return null;
	    }
	    for(int i = 0; i < list.length; i++){
	        if(i != index){
	            temp[inc] = list[i];
	            inc++;
	        }
	    }
	    Object buffer = list[index];
	    list = temp;
	    return buffer;
	}
	
	
	/**
	 *	Remove the first Object that is .equals() to obj
	 *	Return true if an object was removed
	 */
	public boolean remove(Object obj){
	    for(int i = 0; i < list.length; i++){
	        if(list[i].equals(obj)){
	            remove(i);
	            return true;
	        }
	    }
	    return false;
	}
	
	/**
	 *	Change the value stored at index to obj
	 *	Return the value that was replaced
	 *	If index is too big or too smalll, do not change and values and return null
	 */
	public Object set(int index, Object obj){
	    if(get(index) == null)
	        return null;
	    Object buffer = list[index];
	    list[index] = obj;
	    return buffer;
	}
	
	/**
	 *	Return the number of elements that are in the list
	 */
	public int size(){
	    return list.length;
	}
}