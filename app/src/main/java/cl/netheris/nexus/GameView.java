package cl.netheris.nexus;

import android.content.Context;
import android.graphics.*;
import android.view.*;
import java.util.*;

public class GameView extends View {
 private final Paint p=new Paint(3), text=new Paint(3);
 private float px=260,py=520, joyX=145,joyY=590, dx=0,dy=0;
 private boolean moving=false, won=false;
 private int shards=0; private final boolean[] got={false,false,false};
 private final RectF karen=new RectF(650,245,710,325), karencita=new RectF(1030,500,1090,580);
 private final RectF portal=new RectF(1120,125,1245,260);
 private final RectF[] crystals={new RectF(470,150,500,190),new RectF(830,390,860,430),new RectF(960,170,990,210)};
 private String msg="Katherine: Algo alteró las rutas de Netheris. Encuentra 3 fragmentos del Nexus.";
 private long msgUntil=Long.MAX_VALUE;

 public GameView(Context c){super(c); text.setTypeface(Typeface.create("sans",Typeface.BOLD)); setKeepScreenOn(true);}
 private void col(int c){p.setColor(c);}
 @Override protected void onDraw(Canvas c){
  super.onDraw(c); float w=getWidth(),h=getHeight();
  c.drawColor(Color.rgb(5,14,34));
  col(Color.rgb(12,35,62)); for(int i=0;i<9;i++) c.drawRect(i*w/9,0,i*w/9+2,h,p);
  for(int i=0;i<6;i++) c.drawRect(0,i*h/6,w,i*h/6+2,p);
  col(Color.rgb(20,70,88)); c.drawRoundRect(80,80,w-80,h-80,35,35,p);
  col(Color.rgb(8,25,48)); c.drawRoundRect(100,100,w-100,h-100,30,30,p);
  // luminous paths
  p.setStrokeWidth(8); col(Color.rgb(50,160,190)); c.drawLine(180,h/2,w-180,h/2,p); c.drawLine(w/2,120,w/2,h-120,p);
  // portal
  col(shards==3?Color.rgb(150,90,255):Color.rgb(55,55,90)); c.drawRoundRect(portal,18,18,p);
  label(c,"NEXUS",portal.left+13,portal.centerY()+6,22,Color.WHITE);
  for(int i=0;i<3;i++) if(!got[i]){col(Color.rgb(80,235,255)); Path q=new Path(); q.moveTo(crystals[i].centerX(),crystals[i].top);q.lineTo(crystals[i].right,crystals[i].centerY());q.lineTo(crystals[i].centerX(),crystals[i].bottom);q.lineTo(crystals[i].left,crystals[i].centerY());q.close();c.drawPath(q,p);}
  girl(c,karen.centerX(),karen.centerY(),Color.rgb(220,75,55),false,"Karen");
  girl(c,karencita.centerX(),karencita.centerY(),Color.rgb(220,75,55),false,"Karencita");
  girl(c,px,py,Color.rgb(245,210,95),true,"Katherine");
  // HUD
  col(Color.argb(210,4,12,28)); c.drawRoundRect(20,15,440,72,20,20,p);
  label(c,"NETHERIS : NEXUS   Fragmentos "+shards+"/3",40,52,23,Color.WHITE);
  if(System.currentTimeMillis()<msgUntil || msgUntil==Long.MAX_VALUE){col(Color.argb(235,3,10,24));c.drawRoundRect(230,h-118,w-40,h-25,20,20,p);label(c,msg,255,h-67,18,Color.WHITE);}
  // joystick
  col(Color.argb(90,130,220,255)); c.drawCircle(joyX,joyY,70,p); col(Color.argb(170,170,240,255));c.drawCircle(joyX+dx*42,joyY+dy*42,28,p);
  if(won){col(Color.argb(235,3,8,25));c.drawRect(0,0,w,h,p);label(c,"NEXUS RESTAURADO",w/2-180,h/2-25,34,Color.WHITE);label(c,"Katherine, Karen y Karencita vuelven a casa.",w/2-230,h/2+20,19,Color.WHITE);label(c,"Toca la pantalla para jugar otra vez",w/2-190,h/2+65,18,Color.rgb(100,230,255));}
  update(); invalidate();
 }
 private void girl(Canvas c,float x,float y,int hair,boolean glasses,String name){
  col(Color.rgb(238,194,165));c.drawCircle(x,y-20,20,p);col(hair);c.drawArc(x-24,y-48,x+24,y-4,180,180,true,p);c.drawRect(x-23,y-30,x-14,y+1,p);
  col(name.equals("Karencita")?Color.rgb(200,80,70):Color.rgb(55,110,180));c.drawRoundRect(x-19,y,x+19,y+42,8,8,p);
  if(glasses){p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(3);col(Color.BLACK);c.drawCircle(x-8,y-20,7,p);c.drawCircle(x+8,y-20,7,p);c.drawLine(x-1,y-20,x+1,y-20,p);p.setStyle(Paint.Style.FILL);}
  label(c,name,x-38,y+68,14,Color.WHITE);
 }
 private void label(Canvas c,String s,float x,float y,float z,int color){text.setTextSize(z);text.setColor(color);c.drawText(s,x,y,text);}
 private boolean near(RectF r,float range){return Math.abs(px-r.centerX())<range && Math.abs(py-r.centerY())<range;}
 private void update(){
  if(won||!moving)return; px+=dx*6;py+=dy*6; px=Math.max(125,Math.min(getWidth()-125,px));py=Math.max(125,Math.min(getHeight()-125,py));
  for(int i=0;i<3;i++)if(!got[i]&&near(crystals[i],45)){got[i]=true;shards++;say("Fragmento "+shards+"/3 recuperado. La señal del Nexus se estabiliza.");}
  if(near(karen,55))say("Karen: Las rutas del este están inestables. No te confíes.");
  if(near(karencita,55))say("Karencita: ¡Vi un fragmento brillante cerca del portal!");
  if(near(portal,75)){if(shards==3)won=true;else say("Portal bloqueado: faltan "+(3-shards)+" fragmentos.");}
 }
 private void say(String s){if(!msg.equals(s)||System.currentTimeMillis()>msgUntil){msg=s;msgUntil=System.currentTimeMillis()+2200;}}
 @Override public boolean onTouchEvent(android.view.MotionEvent e){
  if(won && e.getAction()==MotionEvent.ACTION_DOWN){px=260;py=520;shards=0;Arrays.fill(got,false);won=false;msg="Katherine: Vamos otra vez.";msgUntil=System.currentTimeMillis()+1800;return true;}
  if(e.getAction()==MotionEvent.ACTION_DOWN||e.getAction()==MotionEvent.ACTION_MOVE){
   float vx=e.getX()-joyX,vy=e.getY()-joyY,d=(float)Math.sqrt(vx*vx+vy*vy);
   if(e.getX()<300 && e.getY()>getHeight()-220){moving=true;if(d>1){dx=vx/d;dy=vy/d;}return true;}
  }
  if(e.getAction()==MotionEvent.ACTION_UP||e.getAction()==MotionEvent.ACTION_CANCEL){moving=false;dx=dy=0;return true;}return true;
 }
}