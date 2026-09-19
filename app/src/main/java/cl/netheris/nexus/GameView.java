package cl.netheris.nexus;
import android.content.Context;import android.graphics.*;import android.view.*;import java.util.*;

public class GameView extends View{
 Paint p=new Paint(3),t=new Paint(3); Random rng=new Random(); float S=1; boolean init=false,inBattle=false,win=false; int hp=300,enemy=260,energy=3,turn=1; String msg="Toca ENTRAR EN COMBATE";
 String[] names={"Pulso","Corte","Firewall","Rayo","Reparar","Overclock"}; int[] power={45,70,0,60,-55,95}; int[] cost={1,2,1,2,1,3}; int[] hand={0,1,2,3,4};
 public GameView(Context c){super(c);t.setTypeface(Typeface.DEFAULT_BOLD);setKeepScreenOn(true);}
 void C(int c){p.setColor(c);p.setStyle(Paint.Style.FILL);} void txt(Canvas c,String s,float x,float y,float z,int col){t.setColor(col);t.setTextSize(z*S);c.drawText(s,x*S,y*S,t);}
 @Override protected void onDraw(Canvas c){super.onDraw(c);S=Math.min(getWidth()/720f,getHeight()/1280f);c.drawColor(Color.rgb(5,12,28));
  txt(c,"NETHERIS : NEXUS",34,62,30,Color.WHITE);txt(c,"RPG DE RED",34,96,15,Color.rgb(80,220,255));
  if(!inBattle){home(c);invalidate();return;} battle(c);invalidate();}
 void home(Canvas c){C(Color.rgb(13,42,70));c.drawRoundRect(35*S,145*S,685*S,850*S,35*S,35*S,p);txt(c,"KATHERINE",255,220,27,Color.WHITE);girl(c,360,390);
  txt(c,"Anomalía detectada en el Nodo Nexus.",105,590,20,Color.WHITE);txt(c,"Combate táctico por turnos + Power Cards",78,630,18,Color.LTGRAY);
  C(Color.rgb(45,145,190));c.drawRoundRect(100*S,720*S,620*S,820*S,25*S,25*S,p);txt(c,"ENTRAR EN COMBATE",185,783,25,Color.WHITE);}
 void girl(Canvas c,float x,float y){C(Color.rgb(240,205,110));c.drawCircle(x*S,(y-70)*S,70*S,p);C(Color.rgb(240,195,165));c.drawCircle(x*S,(y-40)*S,48*S,p);C(Color.rgb(60,130,200));c.drawRoundRect((x-50)*S,y*S,(x+50)*S,(y+145)*S,20*S,20*S,p);p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(6*S);p.setColor(Color.BLACK);c.drawCircle((x-20)*S,(y-45)*S,18*S,p);c.drawCircle((x+20)*S,(y-45)*S,18*S,p);p.setStyle(Paint.Style.FILL);}
 void battle(Canvas c){txt(c,"KATHERINE  HP "+hp+"/300",28,145,22,Color.WHITE);txt(c,"GLITCH  HP "+enemy+"/260",410,145,22,Color.WHITE);
  // vertical tactical lanes
  for(int r=0;r<3;r++)for(int q=0;q<3;q++){C(Color.rgb(18,75+q*10,105));c.drawRoundRect((75+q*105)*S,(210+r*105)*S,(165+q*105)*S,(300+r*105)*S,10*S,10*S,p);}
  for(int r=0;r<3;r++)for(int q=0;q<3;q++){C(Color.rgb(95,35+r*6,65));c.drawRoundRect((390+q*85)*S,(210+r*105)*S,(465+q*85)*S,(300+r*105)*S,10*S,10*S,p);}
  C(Color.rgb(245,210,95));c.drawCircle(225*S,360*S,32*S,p);C(Color.rgb(230,65,85));c.drawCircle(505*S,255*S,35*S,p);
  txt(c,"TURNO "+turn+"   ENERGÍA "+energy+"/3",40,585,22,Color.rgb(100,230,255));txt(c,msg,40,625,17,Color.WHITE);
  txt(c,"POWER CARDS",35,690,22,Color.WHITE);
  for(int i=0;i<5;i++){float y=720+i*92;C(i==4?Color.rgb(75,50,110):Color.rgb(20,65,92));c.drawRoundRect(35*S,y*S,685*S,(y+75)*S,18*S,18*S,p);int id=hand[i];txt(c,names[id],60,y+31,20,Color.WHITE);txt(c,cost[id]+" EN",520,y+31,16,Color.CYAN);String v=power[id]>0?power[id]+" DMG":power[id]<0?(-power[id])+" HP":"ESCUDO";txt(c,v,60,y+59,14,Color.LTGRAY);}
  if(win){C(Color.argb(240,4,10,25));c.drawRect(0,0,getWidth(),getHeight(),p);txt(c,hp>0?"NODO PURIFICADO":"KATHERINE DESCONECTADA",105,540,31,Color.WHITE);txt(c,"Toca para volver a Netheris",145,600,20,Color.CYAN);}}
 void resetBattle(){hp=300;enemy=260;energy=3;turn=1;win=false;inBattle=true;msg="Elige una Power Card";drawHand();}
 void drawHand(){for(int i=0;i<5;i++)hand[i]=rng.nextInt(names.length);}
 void use(int slot){if(win)return;int id=hand[slot];if(cost[id]>energy){msg="Energía insuficiente";return;}energy-=cost[id];if(power[id]>0)enemy-=power[id];else if(power[id]<0)hp=Math.min(300,hp-power[id]);else hp=Math.min(300,hp+20);msg=names[id]+" ejecutado";
  if(enemy<=0){enemy=0;win=true;return;}hp-=25+rng.nextInt(31);if(hp<=0){hp=0;win=true;return;}if(energy==0){turn++;energy=3;drawHand();msg="Turno "+turn+": nuevas cartas";}}
 @Override public boolean onTouchEvent(MotionEvent e){if(e.getAction()!=MotionEvent.ACTION_DOWN)return true;float x=e.getX()/S,y=e.getY()/S;if(win){inBattle=false;win=false;return true;}if(!inBattle){if(y>680){resetBattle();}return true;}if(y>=720&&y<1180){int s=(int)((y-720)/92);if(s>=0&&s<5)use(s);}return true;}
}