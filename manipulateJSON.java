import java.io.*;
import java.io.File;
import java.io.FileInputStream;
import java.util.Scanner;


class PA2_2 {
	public static void main (String[] args){
        try{
            PrintWriter writer = new PrintWriter("FriDat.json", "UTF-8");


            writer.println("{");
            writer.println("\t\"nodes\":[");
            //writer.println("\t\t")
            
            for(int i=0;i<196; i++){
                writer.println("@ATTRIBUTE vectorPos"+ i + " INTEGER");
            }
            writer.println("\n@ATTRIBUTE class {4,9}");
            writer.println("\n@DATA");
            //4: 1~ 250, 9: 251 ~ 500
            
            for(int i=1; i<=500; i++){
                String input_Path = "./mnist8m-49/tr";
                String append_Path;
                if(i<=250){ //Label = 4
                    append_Path = ("4_".concat(Integer.toString(i))).concat(".txt");
                    input_Path=input_Path.concat(append_Path);
                }
                else{   //Label = 9
                    append_Path = ("9_".concat(Integer.toString(i))).concat(".txt");
                    input_Path=input_Path.concat(append_Path);
                }
                InputStream in = new FileInputStream(new File(input_Path));
                BufferedReader reader = new BufferedReader(new InputStreamReader(in));
                StringBuilder out = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    out.append(line);
                }
                String vectorStr = out.toString().replaceAll(" ",",");

                int label;
                if(i<=250)
                    label=4;
                else
                    label=9;
                writer.println(vectorStr+", "+label);
                reader.close();        
            }
            writer.close();
    		
            
        }
        catch(FileNotFoundException e){
            System.err.println("File Not Found");
        }
        catch(IOException e){
            System.err.println("IO Exception");
        }

        ///////////////
        /*
		
        */
	}
}