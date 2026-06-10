#include <box2d/box2d.h>
#include <iostream>
#include <chrono>
#include <thread>
#include <sw/redis++/redis++.h>
#include <csignal>

using namespace sw::redis;

Redis* redis = nullptr;

// Ni signalas al la servilo, ke ĝi sendu la datumojn al la mondo per WebSockets.
void sendiSignalonAlLaSokaServilo () {
    auto pid_opc = redis->get("ws-pid");

    if (pid_opc) {
        std::string pid_ĉeno = *pid_opc; // eltiri la valoron
        pid_t pid = static_cast<pid_t>(std::stoi(pid_ĉeno));

        if (kill(pid, SIGUSR1) == 0) {
            std::cout << "Sendas signalon al pid " << pid_ĉeno << " por dissendi datumojn per websokoj" << std::endl;
        } else {
            perror("Eraro dum sendado de signalo");
        }
    } else {
        std::cerr << "Ŝlosilo ws-pid ne trovita en Redis" << std::endl;
    }
}

int main() {
    std::string redisUrl = "tcp://127.0.0.1:6379";
    redis = new Redis(redisUrl);

    // 1. Mondo sen gravito
    b2Vec2 gravito(0.0f, 0.0f);
    b2World mondo(gravito);

    // 2. Kreas “skatolon” el muroj
    b2BodyDef muroDif;
    muroDif.type = b2_staticBody;

    // Maldekstra muro
    muroDif.position.Set(-20.0f, 0.0f);
    b2Body* maldekstroWall = mondo.CreateBody(&muroDif);
    b2PolygonShape maldekstroFormo;
    maldekstroFormo.SetAsBox(1.0f, 20.0f);
    maldekstroWall->CreateFixture(&maldekstroFormo, 0.0f);

    // Dekstra muro
    muroDif.position.Set(20.0f, 0.0f);
    b2Body* dekstroWall = mondo.CreateBody(&muroDif);
    b2PolygonShape dekstroFormo;
    dekstroFormo.SetAsBox(1.0f, 20.0f);
    dekstroWall->CreateFixture(&dekstroFormo, 0.0f);

    // Suba muro
    muroDif.position.Set(0.0f, -20.0f);
    b2Body* bottomWall = mondo.CreateBody(&muroDif);
    b2PolygonShape bottomFormo;
    bottomFormo.SetAsBox(20.0f, 1.0f);
    bottomWall->CreateFixture(&bottomFormo, 0.0f);

    // Supra muro
    muroDif.position.Set(0.0f, 20.0f);
    b2Body* topWall = mondo.CreateBody(&muroDif);
    b2PolygonShape topFormo;
    topFormo.SetAsBox(20.0f, 1.0f);
    topWall->CreateFixture(&topFormo, 0.0f);

    // 3. Dinamika korpo (ludanto)
    b2BodyDef ludantoDif;
    ludantoDif.type = b2_dynamicBody;
    ludantoDif.position.Set(0.0f, 0.0f);
    b2Body* ludanto = mondo.CreateBody(&ludantoDif);

    // ronda formo
    b2CircleShape ludantoFormo;
    ludantoFormo.m_radius = 1.0f;

    b2FixtureDef fixtureDif;
    fixtureDif.shape = &ludantoFormo;
    fixtureDif.density = 1.0f;
    fixtureDif.friction = 0.3f;
    ludanto->CreateFixture(&fixtureDif);

    // 4. Difinas movrapidecon
    ludanto->SetLinearVelocity(b2Vec2(0.0f, 0.0f));

    // 5. Simulado en reala tempo (30 FPS)
    float tempoPaŝo = 1.0f / 30.0f;
    int32 rapidajIteracioj = 8;
    int32 poziciajIteracioj = 3;

    float koef = 0.05f;

    while (true) {
        auto komenco = std::chrono::high_resolution_clock::now();

        mondo.Step(tempoPaŝo, rapidajIteracioj, poziciajIteracioj);

        b2Vec2 pos = ludanto->GetPosition();
        std::cout << "Ludanto: (" << pos.x << ", " << pos.y << ")" << std::endl;

        // moviĝu dekstren
        pos.x += koef;
        if (pos.x >= 5 || pos.x <= -5) {
            koef = koef * -1;
        }

        ludanto->SetTransform(pos, ludanto->GetAngle());

        // Ni stokas la pozicion en Redis.
        std::ostringstream oss;
        oss << pos.x << "," << pos.y;
        redis->hset("pozicioj-de-ludantoj", "0", oss.str());

        sendiSignalonAlLaSokaServilo();

        auto fino = std::chrono::high_resolution_clock::now();
        std::chrono::duration<float> pasinta = fino - komenco;
        float dormPeriodo = tempoPaŝo - pasinta.count();
        if (dormPeriodo > 0) {
            std::cout << "Dormu dum " << dormPeriodo << std::endl;
            std::this_thread::sleep_for(std::chrono::duration<float>(dormPeriodo));
        } else {
            std::cout << "La skripto malrapidiĝas, ne sukcesas kalkuli sufiĉe rapide" << std::endl;
        }
    }

    return 0;
}

