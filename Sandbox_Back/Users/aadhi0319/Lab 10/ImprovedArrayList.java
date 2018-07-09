import java.util.Arrays;

public class ImprovedArrayList implements MyList {
    private int len;
    private Object[] list;
    
    public ImprovedArrayList(){
        this(0);
    }
    
    public ImprovedArrayList(int insize){
        list = new Object[insize];
        len = 0;
    }

    /**
	 *	Add obj to the end of the list.
	 *	This method always returns true
	 */
	public boolean add(Object obj){
	    checkAdd(1);
	    list[len] = obj;
	    len++;
		return true;
	}
	
	/**
	 *	Add obj to the specified index of the list.
	 *	If index is too big, then add obj to the end of the list
	 *	If index is too small, then add obj to the start of the list
	 */
	public void add(int index, Object obj){
	    if(index >= len){
	    	add(obj);
	    	return;
	    }else if(index < 0){
	    	index = 0;
	    }
	    checkAdd(1);
	    for(int i = len; i >= index; i--){
	    	list[i+1] = list[i];
	    }
	    list[index] = obj;
	    len++;
	}
	
	/**
	 *	Return true is this list contains something that is .equals() to obj
	 */
	public boolean contains(Object obj){
	    for(int i = 0; i < len; i++){
	        if(list[i].equals(obj))
	            return true;
	    }
	    return false;
	}
	
	/**
	 *	Return the Object located at the specified index
	 *	If index is too big or too small, return null
	 */
	public Object get(int index){
	    if(index >= len || index < 0){
	        return null;
	    }
	    return list[index];
	}
	
	/**
	 *	Return true if there are no elements in the list
	 */
	public boolean isEmpty(){
	    return len == 0;
	}
	
	/**
	 *	Remove the Object at the specified index from the list
	 *	Return the Object that was removed
	 *	If index is too big or to small, do not remove anything from the list and return null
	 *  If the list is empty, return null
	 */
	public Object remove(int index){
	    if(index >= len || index < 0 || isEmpty()){
	    	return null;
	    }
	    Object removed = list[index];
	    if(index == len-1){
	    	list[index] = null;
	    }else{
		    for(int i = index; i < len; i++){
		    	list[i] = list[i + 1];
		    }
	    }
	    len--;
	    return removed;
	}
	
	
	/**
	 *	Remove the first Object that is .equals() to obj
	 *	Return true if an object was removed
	 */
	public boolean remove(Object obj){
		for(int i = 0; i < len; i++){
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
	    if(index >= len || index < 0)
	        return null;
	    Object buffer = list[index];
	    list[index] = obj;
	    return buffer;
	}
	
	/**
	 *	Return the number of elements that are in the list
	 */
	public int size(){
	    return len;
	}
	
	public void checkAdd(int inc){
	    if((len + inc) > list.length){
	        Object[] buffer = new Object[list.length+10];
	        for(int i = 0; i < list.length; i++){
	            buffer[i] = list[i];
	        }
	        list = buffer;
	    }
	}
	
	public String toString(){
		return len + " " + Arrays.toString(list);
	}
} 